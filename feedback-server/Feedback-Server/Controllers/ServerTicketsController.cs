using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FeedbackServer.Models;
using FeedbackServer.Helper;

namespace FeedbackServer.Controllers
{
    [Route("api/v{version:apiVersion}/domains/{domainID:int}/projects/{projectID:int}/tickets")]
    public class ServerTicketsController : ExtendedController
    {
        public ServerTicketsController(LocalDBContext context) : base(context)
        {

        }

        [HttpGet]
        public async Task<IActionResult> GetAllTickets([FromRoute]int domainID, [FromRoute]int projectID)
        {
            try
            {
                base.SetAuthIdentifierFromRequest();

                var domainProjectTicketsOrdered = await QueryHelper.GetDomainProjectTicketsAuthenticatedQuery(_context, _authIdentifier, domainID, projectID)
                                    .Include(t => t.Annotations)
                                    .OrderBy(t => t.ViewedAt != null) // "!= null is" important for correct sorting!
                                    .ThenBy(t => t.Closed)
                                    .ThenByDescending(t => t.Sent)
                                    .ToListAsync();

                if (domainProjectTicketsOrdered == null)
                {
                    return NotFound(new
                    {
                        header = "The given domain-id or project-id was not found in your account",
                        subheader = "",
                        text = "Please check the ids."
                    });
                }

                return Ok(domainProjectTicketsOrdered);
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
        public async Task<IActionResult> GetTicket([FromRoute]int domainID, [FromRoute]int projectID, [FromRoute] int id)
        {
            try
            {
                base.SetAuthIdentifierFromRequest();

                var ticket = await QueryHelper.GetDomainProjectTicketsAuthenticatedQuery(_context, _authIdentifier, domainID, projectID)
                                    .Include(s => s.Sharings)
                                    .Include(t => t.Annotations).ThenInclude(a => a.Ratings)
                                    .FirstOrDefaultAsync(t => t.Id == id);

                if (ticket == null)
                {
                    return NotFound(new
                    {
                        header = "The given ticket-id was not found in your projects",
                        subheader = "",
                        text = "Please check the id."
                    });
                }

                if (string.IsNullOrEmpty(ticket.ViewedAt))
                {
                    _context.Tickets.Attach(ticket); // to recoqnize changes
                    ticket.ViewedAt = DateTime.UtcNow.ToString("o");
                    await _context.SaveChangesAsync();
                }

                return Ok(ticket);
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

        [HttpPut("{id}/close")]
        public async Task<IActionResult> CloseTicket([FromRoute]int domainID, [FromRoute]int projectID, [FromRoute] int id, [FromBody] TicketPutBase boundObject)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                base.SetAuthIdentifierFromRequest();

                var ticket = await QueryHelper.GetDomainProjectTicketsAuthenticatedQuery(_context, _authIdentifier, domainID, projectID)
                                    .FirstOrDefaultAsync(t => t.Id == id);

                if (ticket == null)
                {
                    return NotFound(new
                    {
                        header = "The given ticket-id was not found in your projects",
                        subheader = "",
                        text = "Please check the id."
                    });
                }

                _context.Tickets.Attach(ticket); // to recoqnize changes


                ticket.Closed = boundObject.Closed;


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

                var ticket = await QueryHelper.GetDomainProjectTicketsAuthenticatedQuery(_context, _authIdentifier, domainID, projectID)
                                    .FirstOrDefaultAsync(t => t.Id == id);

                if (ticket == null)
                {
                    return NotFound(new
                    {
                        header = "The given ticket-id was not found in your projects",
                        subheader = "",
                        text = "Please check the id."
                    });
                }
                if (!boundObject.ForceOverwrite && !string.IsNullOrWhiteSpace(ticket.IotaTransactionHash))
                {
                    return Conflict(new
                    {
                        header = "Conflict",
                        subheader = "",
                        text = "The payment is already done."
                    });
                }

                _context.Tickets.Attach(ticket); // to recoqnize changes

                ticket.IotaTransactionHash = boundObject.TransactionHash;

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

                var ticket = await QueryHelper.GetDomainProjectTicketsAuthenticatedQuery(_context, _authIdentifier, domainID, projectID)
                                    .Include(s => s.Sharings)
                                    .FirstOrDefaultAsync(s => s.Id == id);

                if (ticket == null)
                {
                    return NotFound(new
                    {
                        header = "The given ticket-id was not found in your projects",
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

                if (ticket.Sharings.Any(s => s.Email == boundObject.Email))
                {
                    return Conflict(new
                    {
                        header = "Conflict",
                        subheader = "",
                        text = "The alternative selection is already shared to this email."
                    });
                }

                TicketSharing sharing = new TicketSharing()
                {
                    TicketId = ticket.Id,
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

                _context.TicketSharings.Add(sharing);
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
        public async Task<IActionResult> DeleteTicket([FromRoute]int domainID, [FromRoute]int projectID, [FromRoute] int id)
        {
            try
            {
                base.SetAuthIdentifierFromRequest();

                var ticket = await QueryHelper.GetDomainProjectTicketsAuthenticatedQuery(_context, _authIdentifier, domainID, projectID)
                                    .FirstOrDefaultAsync(t => t.Id == id);

                if (ticket == null)
                {
                    return NotFound(new
                    {
                        header = "The given ticket-id was not found in your projects",
                        subheader = "",
                        text = "Please check the id."
                    });
                }

                _context.Tickets.Remove(ticket);
                await _context.SaveChangesAsync();

                return Ok(ticket);
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
    }
}