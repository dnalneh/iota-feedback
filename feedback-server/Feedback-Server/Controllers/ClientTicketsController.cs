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
    [Route("api/v{version:apiVersion}/projects/{projectCode:Guid}/tickets")]
    public class ClientTicketsController : ExtendedController
    {
        private RegexUtilities _regexUtil = new RegexUtilities();
        private IHubContext<NewFeedbackHub> _hubContext;

        public ClientTicketsController(LocalDBContext context, IHubContext<NewFeedbackHub> hubContext) : base(context)
        {
            _hubContext = hubContext;
        }

        [HttpGet("{viewguid}")]
        public async Task<IActionResult> ClientModuleGetByViewID([FromRoute] Guid projectCode, Guid viewguid)
        {
            // Whether the ticket fits the current url is handled on the client side

            var ticket = await _context.Tickets
                            .Include(t => t.Annotations)
                            .ThenInclude(a => a.Ratings)
                            .SingleOrDefaultAsync(t => t.ViewGuid == viewguid);

            if (ticket != null)
            {
                return Ok(ticket);
            }
            else
            {
                return NotFound(new
                {
                    header = "Nothing found at this specific url!",
                    subheader = "",
                    text = "Please check your ticket-ID."
                });
            }
        }

        [HttpPost]
        [Route("public")]
        public async Task<IActionResult> ClientModuleGetPublic([FromRoute] Guid projectCode, [FromBody] ClientModuleGetPublicPostBase boundObject)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var projectDB = await _context.Projects.SingleOrDefaultAsync(t => t.Code == projectCode);

            if (projectDB == null)
            {
                return NotFound(new
                {
                    header = "A project with this code was not found!",
                    subheader = "",
                    text = "Please check your project-code."
                });
            }

            var tickets = await _context.Tickets.Where(t => t.ProjectId == projectDB.Id && t.IsPublic)
                            .Include(t => t.Annotations).ThenInclude(a => a.Ratings).ToListAsync();

            boundObject.Url = boundObject.Url.Split('?', '#')[0]; // without Querystring and Hash

            List<Ticket> filteredTickets = new List<Ticket>();
            foreach (var ticket in tickets)
            {
                if ((ticket.Url ?? "").Split('?', '#')[0] == boundObject.Url) // without Querystring and Hash
                {
                    // make it more anonym:
                    ticket.Name = "";
                    ticket.Email = "";
                    ticket.IotaAddress = "";
                    filteredTickets.Add(ticket);
                }
            }

            return Ok(filteredTickets);
        }

        [HttpPost]
        public async Task<IActionResult> ClientModulePostTicket([FromRoute] Guid projectCode, [FromBody] TicketPostBase boundObject)
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

            Ticket ticket = new Ticket()
            {
                Name = boundObject.Name,
                Email = boundObject.Email,
                IotaAddress = boundObject.IotaAddress,
                NavigatorString = boundObject.NavigatorString,
                BrowserFontSize = boundObject.BrowserFontSize,
                ScreenHeight = boundObject.ScreenHeight,
                ScreenWidth = boundObject.ScreenWidth,
                Annotations = boundObject.Annotations,
                Sent = boundObject.Sent,
                IsPublic = boundObject.IsPublic,
                Url = boundObject.Url,

                ViewGuid = GUIDHelper.CreateCryptographicallySecureGuid(), // a test if same ViewGuid already exists would be good
                ProjectId = projectDB.Id
            };


            _context.Tickets.Add(ticket);
            await _context.SaveChangesAsync();

            //Task.Run(() => // not a good idea in ASP.net!
            //{
            //    Email.DefaultSender = new MailgunSender("", // Mailgun Domain
            //                                          "" // Mailgun API Key
            //        );

            //    var email = Email
            //                    .From("no-reply@annotation.com")
            //                    .To(ticket.Email)
            //                    .Subject("Thanks for your feedback")
            //                    .Body("Thank you");
            //    email.Send();
            //});

            var domainDB = await _context.Domains.FirstOrDefaultAsync(d => d.Id == projectDB.DomainId);
            if (domainDB != null)
            {
                await _hubContext.Clients.All.SendAsync("TicketAdded", new
                {
                    authIdentifier = domainDB.UserAuthIdentifier,
                    domain = domainDB.Url,
                    projectName = projectDB.Name,
                    domainId = domainDB.Id,
                    projectId = projectDB.Id,
                    ticketId = ticket.Id,
                    sent = ticket.Sent
                }); // would be better to take an extra (temporary) identifier, that the client-side stores
            }

            return CreatedAtAction(nameof(ClientModuleGetByViewID), new { viewGuid = ticket.ViewGuid }, ticket);
        }

        [HttpPost]
        [Route("rateannotation")]
        public async Task<IActionResult> ClientModuleRateAnnotation([FromRoute] Guid projectCode, [FromBody] ClientModuleRateAnnotationPostBase boundObject)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var annotationDB = await _context.Annotations.SingleOrDefaultAsync(a => a.Guid == boundObject.Guid);

            if (annotationDB == null)
            {
                return NotFound(new
                {
                    header = "An annotation with this guid was not found!",
                    subheader = "",
                    text = "Please check the guid."
                });
            }

            AnnotationRating rating = new AnnotationRating()
            {
                AnnotationId = annotationDB.Id,
                RateValue = boundObject.RateValue
            };

            _context.AnnotationRatings.Add(rating);
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}