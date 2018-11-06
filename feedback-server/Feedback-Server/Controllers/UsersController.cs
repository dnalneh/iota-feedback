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
    [Route("api/v{version:apiVersion}/users")]
    public class UsersController : ExtendedController
    {
        public UsersController(LocalDBContext context) : base(context)
        {

        }

        [HttpGet]
        public async Task<IActionResult> GetUser()
        {
            try
            {
                base.SetAuthIdentifierFromRequest();

                var userDB = await _context.Users.SingleOrDefaultAsync(m => m.AuthIdentifier == _authIdentifier);

                if (userDB == null)
                {
                    return NotFound(new
                    {
                        header = "The given user was not found",
                        subheader = "",
                        text = "Please register first."
                    });
                }

                return Ok(userDB);
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

        [HttpGet("welcomedata")]
        public async Task<IActionResult> GetWelcomeData()
        {
            try
            {
                base.SetAuthIdentifierFromRequest();

                var numberOfUnviewedTickets = await QueryHelper.GetDomainsAuthenticatedQuery(_context, _authIdentifier)
                                                .SelectMany(d => d.Projects)
                                                .SelectMany(p => p.Tickets)
                                                .CountAsync(t => t.ViewedAt == null);
                var numberOfUnviewedSelections = await QueryHelper.GetDomainsAuthenticatedQuery(_context, _authIdentifier)
                                .SelectMany(d => d.Projects)
                                .SelectMany(p => p.AlternativesSelections)
                                .CountAsync(t => t.ViewedAt == null);

                return Ok(new {
                    numberOfUnviewedTickets,
                    numberOfUnviewedSelections
                });
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

        [HttpPut]
        public async Task<IActionResult> PutUser([FromBody] UserPutBase boundObject)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                base.SetAuthIdentifierFromRequest();

                var userDB = await _context.Users.SingleOrDefaultAsync(m => m.AuthIdentifier == _authIdentifier);

                if (userDB == null)
                {
                    return NotFound(new
                    {
                        header = "The given user was not found",
                        subheader = "",
                        text = "Please register first."
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

                if (!string.IsNullOrWhiteSpace(boundObject.IotaSeed) && !IOTAHelper.IsTrytes(boundObject.IotaSeed, 81))
                {
                    return BadRequest(new
                    {
                        header = "Input error",
                        subheader = "",
                        text = "Please submit a valid seed of 81 characters from range A-Z and number 9."
                    });
                }

                _context.Users.Attach(userDB); // to recoqnize changes

                userDB.Email = boundObject.Email;
                userDB.IotaSeed = boundObject.IotaSeed;
                userDB.IotaNode = boundObject.IotaNode;

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

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] UserPostBase boundObject)
        {
            try
            {
                base.SetAuthIdentifierFromRequest();

                // Add user if not exists
                if (!await _context.Users.AnyAsync(m => m.AuthIdentifier == _authIdentifier))
                {
                    if (!new RegexUtilities().IsValidEmail(boundObject.Email))
                    {
                        return BadRequest(new
                        {
                            header = "Input error",
                            subheader = "",
                            text = "Please submit a valid email."
                        });
                    }

                    User user = new User() { AuthIdentifier = _authIdentifier, Email = boundObject.Email };
                    _context.Users.Add(user);
                    await _context.SaveChangesAsync();

                    return CreatedAtAction(nameof(GetUser), new { authIdentifier = user.AuthIdentifier }, user);
                }
                else
                {
                    return Conflict(new
                    {
                        header = "Conflict",
                        subheader = "",
                        text = "This user already exists."
                    });
                }
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


        [HttpDelete]
        public async Task<IActionResult> DeleteUser()
        {
            try
            {
                base.SetAuthIdentifierFromRequest();

                var userDB = await _context.Users.SingleOrDefaultAsync(m => m.AuthIdentifier == _authIdentifier);

                if (userDB == null)
                {
                    return NotFound(new
                    {
                        header = "The given user was not found",
                        subheader = "",
                        text = "Please register first."
                    });
                }

                _context.Users.Remove(userDB);


                await _context.SaveChangesAsync();

                return Ok(userDB);
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