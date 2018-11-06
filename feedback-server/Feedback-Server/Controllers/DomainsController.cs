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
    [Route("api/v{version:apiVersion}/domains")]
    public class DomainsController : ExtendedController
    {
        public DomainsController(LocalDBContext context) : base(context)
        {

        }

        [HttpGet]
        public IActionResult GetAllDomains()
        {
            try
            {
                base.SetAuthIdentifierFromRequest();

                var domainsWithProjects = QueryHelper.GetDomainsAuthenticatedQuery(_context, _authIdentifier).Include(d => d.Projects);

                return Ok(domainsWithProjects);
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
        public async Task<IActionResult> PostDomain([FromBody] DomainPostBase boundObject)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                base.SetAuthIdentifierFromRequest();

                string url = boundObject.Url.ToLower();

                if (url != "localhost:8081")
                {
                    // add protocol to prevent errors in the following new Uri(...)
                    if (!url.StartsWith("http://") && !url.StartsWith("https://"))
                    {
                        url = "http://" + url;
                    }
                    //extract hostname and skip the protocol part
                    boundObject.Url = UrlHelper.NormalizeUrl(new Uri(url).Host);
                }

                var domainDB = await _context.Domains.FirstOrDefaultAsync(d => d.Url == boundObject.Url);
                if (domainDB != null)
                {
                    if (domainDB.UserAuthIdentifier == _authIdentifier)
                    {
                        return Conflict(new
                        {
                            header = "Conflict",
                            subheader = "",
                            text = "The domain '" + domainDB.Url + "' already exists in your domains."
                        });
                    }
                }

                // generate real Domain
                Domain domain = new Domain
                {
                    Url = boundObject.Url,
                    UserAuthIdentifier = _authIdentifier
                };

                _context.Domains.Add(domain);
                await _context.SaveChangesAsync();

                return StatusCode(201, domain); // no uri is delivered

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
        public async Task<IActionResult> DeleteDomain([FromRoute] int id)
        {
            try
            {
                base.SetAuthIdentifierFromRequest();

                var domain = await QueryHelper.GetDomainByIDAuthenticatedAsync(_context, _authIdentifier, id);

                if (domain == null)
                {
                    return NotFound(new
                    {
                        header = "The given domain-id was not found in your domains",
                        subheader = "",
                        text = "Please check the id."
                    });
                }

                _context.Domains.Remove(domain);
                await _context.SaveChangesAsync();

                return Ok(domain);
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