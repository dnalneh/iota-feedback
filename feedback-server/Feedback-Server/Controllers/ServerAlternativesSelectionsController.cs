using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FeedbackServer.Models;
using FeedbackServer.Helper;
using FluentEmail.Core;
using FluentEmail.Mailgun;

namespace FeedbackServer.Controllers
{
    [Route("api/v{version:apiVersion}/domains/{domainID:int}/projects/{projectID:int}/alternativesselections")]
    public class ServerAlternativesSelectionsController : ExtendedController
    {
        public ServerAlternativesSelectionsController(LocalDBContext context) : base(context)
        {

        }

        [HttpGet]
        public async Task<IActionResult> GetAllSelections([FromRoute]int domainID, [FromRoute]int projectID)
        {
            try
            {
                base.SetAuthIdentifierFromRequest();

                var domainProjectSelectionsOrdered = await QueryHelper.GetDomainProjectAlternativesSelectionsAuthenticatedQuery(_context, _authIdentifier, domainID, projectID)
                                    .OrderBy(t => t.ViewedAt != null) // "!= null is" important for correct sorting!
                                    .ThenByDescending(t => t.Sent)
                                    .ToListAsync();

                if (domainProjectSelectionsOrdered == null)
                {
                    return NotFound(new
                    {
                        header = "The given domain-id or project-id was not found in your account",
                        subheader = "",
                        text = "Please check the ids."
                    });
                }

                return Ok(domainProjectSelectionsOrdered);
            }
            catch (MissingAuthIdentifierException)
            {
                return _statusCode;
            }
            catch
            {
                throw;
            }

        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetSelection([FromRoute]int domainID, [FromRoute]int projectID, [FromRoute] int id)
        {
            try
            {
                base.SetAuthIdentifierFromRequest();

                var selection = await QueryHelper.GetDomainProjectAlternativesSelectionsAuthenticatedQuery(_context, _authIdentifier, domainID, projectID)
                                    .Include(s => s.AreaInfoItems)
                                    .Include(s => s.Sharings)
                                    .FirstOrDefaultAsync(s => s.Id == id);

                if (selection == null)
                {
                    return NotFound(new
                    {
                        header = "The given selection-id was not found in your projects",
                        subheader = "",
                        text = "Please check the id."
                    });
                }

                if (string.IsNullOrEmpty(selection.ViewedAt))
                {
                    _context.AlternativesSelections.Attach(selection); // to recoqnize changes
                    selection.ViewedAt = DateTime.UtcNow.ToString("o");
                    await _context.SaveChangesAsync();
                }

                return Ok(selection);
            }
            catch (MissingAuthIdentifierException)
            {
                return _statusCode;
            }
            catch
            {
                throw;
            }
        }

        [HttpPut("{id}/settransactionhash")]
        public async Task<IActionResult> SetTransactionHash([FromRoute]int domainID, [FromRoute]int projectID, [FromRoute] int id, [FromBody] TransactionHashPutBase boundObject)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                base.SetAuthIdentifierFromRequest();

                var selection = await QueryHelper.GetDomainProjectAlternativesSelectionsAuthenticatedQuery(_context, _authIdentifier, domainID, projectID)
                                    .FirstOrDefaultAsync(s => s.Id == id);

                if (selection == null)
                {
                    return NotFound(new
                    {
                        header = "The given selection-id was not found in your projects",
                        subheader = "",
                        text = "Please check the id."
                    });
                }
                if (!boundObject.ForceOverwrite && !string.IsNullOrWhiteSpace(selection.IotaTransactionHash))
                {
                    return Conflict(new
                    {
                        header = "Conflict",
                        subheader = "",
                        text = "The payment is already done."
                    });
                }

                _context.AlternativesSelections.Attach(selection); // to recoqnize changes

                selection.IotaTransactionHash = boundObject.TransactionHash;

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (MissingAuthIdentifierException)
            {
                return _statusCode;
            }
            catch
            {
                throw;
            }
        }

        [HttpPost("{id}/addsharing")]
        public async Task<IActionResult> AddSharing([FromRoute]int domainID, [FromRoute]int projectID, [FromRoute] int id, [FromBody] SharingPutBase boundObject)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                base.SetAuthIdentifierFromRequest();

                var selection = await QueryHelper.GetDomainProjectAlternativesSelectionsAuthenticatedQuery(_context, _authIdentifier, domainID, projectID)
                                    .Include(s => s.Sharings)
                                    .FirstOrDefaultAsync(s => s.Id == id);

                if (selection == null)
                {
                    return NotFound(new
                    {
                        header = "The given selection-id was not found in your projects",
                        subheader = "",
                        text = "Please check the id."
                    });
                }

                if (!new RegexUtilities().IsValidEmail(boundObject.Email))
                {
                    return BadRequest(new
                    {
                        header = "Input error",
                        subheader = "",
                        text = "Please submit a valid email."
                    });
                }

                if (selection.Sharings.Any(s => s.Email == boundObject.Email))
                {
                    return Conflict(new
                    {
                        header = "Conflict",
                        subheader = "",
                        text = "The alternative selection is already shared to this email."
                    });
                }

                AlternativesSelectionSharing sharing = new AlternativesSelectionSharing()
                {
                    AlternativesSelectionId = selection.Id,
                    Email = boundObject.Email,
                    Sent = boundObject.Sent
                };

                //Task.Run(() => // not a good idea in ASP.net!
                //{
                //    Email.DefaultSender = new MailgunSender("", // Mailgun Domain
                //                                          "" // Mailgun API Key
                //        );

                //    var email = Email
                //                    .From("no-reply@annotation.com")
                //                    .To(sharing.Email)
                //                    .Subject("There is a shared alternative selection for you")
                //                    .Body(calculateURL(selection));
                //    email.Send();
                //});

                _context.AlternativesSelectionSharings.Add(sharing);
                await _context.SaveChangesAsync();

                return Ok();
            }
            catch (MissingAuthIdentifierException)
            {
                return _statusCode;
            }
            catch
            {
                throw;
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSelection([FromRoute]int domainID, [FromRoute]int projectID, [FromRoute] int id)
        {
            try
            {
                base.SetAuthIdentifierFromRequest();

                var selection = await QueryHelper.GetDomainProjectAlternativesSelectionsAuthenticatedQuery(_context, _authIdentifier, domainID, projectID)
                                    .FirstOrDefaultAsync(t => t.Id == id);

                if (selection == null)
                {
                    return NotFound(new
                    {
                        header = "The given selection-id was not found in your projects",
                        subheader = "",
                        text = "Please check the id."
                    });
                }

                _context.AlternativesSelections.Remove(selection);
                await _context.SaveChangesAsync();

                return Ok(selection);
            }
            catch (MissingAuthIdentifierException)
            {
                return _statusCode;
            }
            catch
            {
                throw;
            }
        }

        private string calculateURL(AlternativesSelection selection)
        {
            string newUrl;
            if (!selection.Url.Contains("?"))
            {
                // no params
                newUrl =
                  selection.Url +
                  "?fm__selection_viewguid=" +
                  selection.ViewGuid;
            }
            else
            {
                // params exists
                newUrl =
                  selection.Url +
                  "&fm__selection_viewguid=" +
                  selection.ViewGuid;
            }
            return newUrl;
        }
    }
}