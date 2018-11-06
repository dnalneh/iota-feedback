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
    [Route("api/v{version:apiVersion}/domains/{domainID:int}/projects/{projectID:int}/tickets/{ticketID:int}/annotations")]
    public class AnnotationsController : ExtendedController
    {
        public AnnotationsController(LocalDBContext context) : base(context)
        {

        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAnnotation([FromRoute]int domainID, [FromRoute]int projectID, [FromRoute] int ticketID, [FromRoute] int id)
        {
            try
            {
                base.SetAuthIdentifierFromRequest();

                var annotation = await QueryHelper.GetDomainProjectTicketsAuthenticatedQuery(_context, _authIdentifier, domainID, projectID)
                                    .Where(t => t.Id == ticketID)
                                    .SelectMany(t => t.Annotations).FirstOrDefaultAsync(a => a.Id == id);

                if (annotation == null)
                {
                    return NotFound(new
                    {
                        header = "The given annotation-id was not found in your projects",
                        subheader = "",
                        text = "Please check the id."
                    });
                }

                _context.Annotations.Remove(annotation);
                await _context.SaveChangesAsync();

                return Ok(annotation);
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