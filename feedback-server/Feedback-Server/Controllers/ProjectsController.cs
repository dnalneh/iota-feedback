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
    [Route("api/v{version:apiVersion}/domains/{domainID:int}/projects")]
    public class ProjectsController : ExtendedController
    {
        public ProjectsController(LocalDBContext context) : base(context)
        {

        }

        [HttpGet]
        public async Task<IActionResult> GetAllProjects([FromRoute]int domainID)
        {
            try
            {
                base.SetAuthIdentifierFromRequest();

                var domainProjects = await QueryHelper.GetDomainProjectsAuthenticatedQuery(_context, _authIdentifier, domainID)
                                    .Include(p => p.Tickets)
                                    .Include(p => p.AlternativesSelections)
                                    .ToListAsync();

                if (domainProjects == null)
                {
                    return NotFound(new
                    {
                        header = "The given domain-id was not found in your domains",
                        subheader = "",
                        text = "Please check the id."
                    });
                }

                return Ok(domainProjects);
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
        public async Task<IActionResult> GetProject([FromRoute]int domainID, [FromRoute] int id)
        {
            try
            {
                base.SetAuthIdentifierFromRequest();

                var projectDB = await QueryHelper.GetDomainProjectsAuthenticatedQuery(_context, _authIdentifier, domainID)
                                       .FirstOrDefaultAsync(p => p.Id == id);

                if (projectDB == null)
                {
                    return NotFound(new
                    {
                        header = "The given project-id was not found in your projects",
                        subheader = "",
                        text = "Please check the id."
                    });
                }

                return Ok(projectDB);
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

        [HttpPut("{id}")]
        public async Task<IActionResult> PutProject([FromRoute]int domainID, [FromRoute] int id, [FromBody] ProjectPostAndPutBase boundObject)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                base.SetAuthIdentifierFromRequest();

                var domainProjects = await QueryHelper.GetDomainProjectsAuthenticatedQuery(_context, _authIdentifier, domainID).ToListAsync();
                var projectDB = domainProjects.FirstOrDefault(p => p.Id == id);

                if (projectDB == null)
                {
                    return NotFound(new
                    {
                        header = "The given project-id was not found in your projects",
                        subheader = "",
                        text = "Please check the id."
                    });
                }

                _context.Projects.Attach(projectDB); // to recoqnize changes

                // Update only relevant fields
                string emailToLower = boundObject.NotificationEmail.ToLower();

                if (projectDB.NotificationEmail != emailToLower)
                {
                    if (new RegexUtilities().IsValidEmail(emailToLower))
                    {
                        projectDB.NotificationEmail = emailToLower;
                    }
                }

                boundObject.Name = boundObject.Name.Trim();

                if (domainProjects.Any(p => p.Name == boundObject.Name && p.Id != id))
                {
                    return Conflict(new
                    {
                        header = "Conflict",
                        subheader = "",
                        text = "There is already a project with the name '" + boundObject.Name + "' in your projects."
                    });
                }

                projectDB.Name = boundObject.Name;
                projectDB.Description = boundObject.Description;
                projectDB.IsPaused = boundObject.IsPaused;

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
        public async Task<IActionResult> PostProject([FromRoute]int domainID, [FromBody] ProjectPostAndPutBase boundObject)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                base.SetAuthIdentifierFromRequest();

                if (!new RegexUtilities().IsValidEmail(boundObject.NotificationEmail))
                {
                    return BadRequest(new
                    {
                        header = "Input error",
                        subheader = "",
                        text = "Please submit a valid email."
                    });
                }

                var domainDB = await QueryHelper.GetDomainByIDAuthenticatedAsync(_context, _authIdentifier, domainID);
                if (domainDB == null)
                {
                    return NotFound(new
                    {
                        header = "The given domain-id was not found in your domains",
                        subheader = "",
                        text = "Please check the id."
                    });
                }

                boundObject.Name = boundObject.Name.Trim();

                await _context.Entry(domainDB).Collection(t => t.Projects).LoadAsync(); // load explicitly

                if (domainDB.Projects.Any(p => p.Name == boundObject.Name && p.DomainId == domainID))
                {
                    return Conflict(new
                    {
                        header = "Conflict",
                        subheader = "",
                        text = "There is already a project with the name '" + boundObject.Name + "' in your projects."
                    });
                }

                // generate real Project
                Project project = new Project
                {
                    Name = boundObject.Name,
                    Description = boundObject.Description,
                    Code = GUIDHelper.CreateCryptographicallySecureGuid(), // a test if same ViewGuid already exists would be good
                    NotificationEmail = boundObject.NotificationEmail,
                    IsPaused = boundObject.IsPaused,

                    DomainId = domainID
                };

                _context.Projects.Add(project);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetProject), new { id = project.Id }, project);

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
        public async Task<IActionResult> DeleteProject([FromRoute]int domainID, [FromRoute] int id)
        {
            try
            {
                base.SetAuthIdentifierFromRequest();

                var projectDB = await QueryHelper.GetDomainProjectsAuthenticatedQuery(_context, _authIdentifier, domainID)
                                        .FirstOrDefaultAsync(p => p.Id == id);

                if (projectDB == null)
                {
                    return NotFound(new
                    {
                        header = "The given project-id was not found in your projects",
                        subheader = "",
                        text = "Please check the id."
                    });
                }

                _context.Projects.Remove(projectDB);
                await _context.SaveChangesAsync();

                return Ok(projectDB);
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