using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FeedbackServer.Controllers;
using FeedbackServer.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Feedback_Server.Controllers
{
    [AllowAnonymous]
    [Route("api/v{version:apiVersion}/healthcheck")]
    public class HealthCheckController : ExtendedController
    {
        public HealthCheckController(LocalDBContext context) : base(context)
        {

        }

        [HttpGet]
        public async Task Check()
        {
            string text = "";
            byte[] data;

            try
            {
                _context.Domains.Any();
                text = "<h1>Web-Api & Database is up and running!</h1>";
            }
            catch (Exception)
            {
                text = "<h1>Web-Api is running, but Database is not accessable!</h1>";
            }
            finally
            {
                data = System.Text.Encoding.UTF8.GetBytes(text);
                await Response.Body.WriteAsync(data, 0, data.Length);
            }
        }
    }
}