using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FeedbackServer.Models;
using FeedbackServer.Helper;
using FluentEmail.Mailgun;
using FluentEmail.Core;
using Microsoft.AspNetCore.Authorization;
using FeedbackServer.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace FeedbackServer.Controllers
{
    [AllowAnonymous]
    [Route("api/v{version:apiVersion}/projects/{projectCode:Guid}/alternativesselections")]
    public class ClientAlternativesSelectionsController : ExtendedController
    {
        private RegexUtilities _regexUtil = new RegexUtilities();
        private IHubContext<NewFeedbackHub> _hubContext;

        public ClientAlternativesSelectionsController(LocalDBContext context, IHubContext<NewFeedbackHub> hubContext) : base(context)
        {
            _hubContext = hubContext;
        }

        [HttpGet("{viewguid}")]
        public async Task<IActionResult> ClientModuleGetByViewID([FromRoute] Guid projectCode, Guid viewguid)
        {
            // would be better to take care that the selection fits the current url

            var selection = await _context.AlternativesSelections
                                    .Include(t => t.AreaInfoItems)
                                    .SingleOrDefaultAsync(t => t.ViewGuid == viewguid);
            if (selection != null)
            {
                return Ok(selection);
            }
            else
            {
                return NotFound(new
                {
                    header = "Nothing found at this specific url!",
                    subheader = "",
                    text = "Please check your selection-ID."
                });
            }
        }

        [HttpPost]
        public async Task<IActionResult> ClientModulePostAlternativesSelection([FromRoute] Guid projectCode, [FromBody] AlternativesSelectionPostBase boundObject, ApiVersion version)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var projectDB = await _context.Projects.FirstOrDefaultAsync(p => p.Code == projectCode);

            if (projectDB == null)
            {
                return Conflict(new
                {
                    header = "Please contact the website admin.",
                    subheader = "",
                    text = "The project-id '" + projectCode + "' is not registered."
                });
            }
            else if (projectDB.IsPaused)
            {
                return Conflict(new
                {
                    header = "Please be patient.",
                    subheader = "",
                    text = "This page is currently paused for feedback."
                });
            }

            if (!String.IsNullOrEmpty(boundObject.IotaAddress))
            {
                if (!IOTAHelper.IsAddress(boundObject.IotaAddress))
                {
                    return BadRequest(new
                    {
                        header = "Input error",
                        subheader = "",
                        text = "The submitted IOTA address is not a valid address, please check it."
                    });
                }
            }

            if (!String.IsNullOrEmpty(boundObject.Email))
            {
                if (!_regexUtil.IsValidEmail(boundObject.Email))
                {
                    return BadRequest(new
                    {
                        header = "Input error",
                        subheader = "",
                        text = "The submitted email address is not a valid address, please check it."
                    });
                }
            }

            if (boundObject.Url.EndsWith("/"))
            {
                boundObject.Url.Remove(boundObject.Url.Length - 1);
            }

            AlternativesSelection selection = new AlternativesSelection()
            {
                Name = boundObject.Name,
                Email = boundObject.Email,
                IotaAddress = boundObject.IotaAddress,
                Sent = boundObject.Sent,
                AreaInfoItems = boundObject.AreaInfoItems,
                Url = boundObject.Url,

                ViewGuid = GUIDHelper.CreateCryptographicallySecureGuid(), // a test if same ViewGuid already exists would be good
                ProjectId = projectDB.Id
            };


            _context.AlternativesSelections.Add(selection);
            await _context.SaveChangesAsync();

            var domainDB = await _context.Domains.FirstOrDefaultAsync(d => d.Id == projectDB.DomainId);
            if (domainDB != null)
            {
                await _hubContext.Clients.All.SendAsync("AlternativesSelectionAdded", new {
                    authIdentifier = domainDB.UserAuthIdentifier,
                    domain = domainDB.Url,
                    projectName = projectDB.Name,
                    domainId = domainDB.Id,
                    projectId = projectDB.Id,
                    alternativesSelectionId = selection.Id,
                    sent = selection.Sent
                }); // would be better to take an extra (temporary) identifier, that the client-side stores
            }

            return CreatedAtAction(nameof(ClientModuleGetByViewID), new { projectCode, viewGuid = selection.ViewGuid, version = $"{version}" }, selection);
        }
    }
}