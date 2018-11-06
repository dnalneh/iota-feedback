using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using FeedbackServer.Helper;
using FeedbackServer.Models;
using Microsoft.AspNetCore.Authorization;

namespace FeedbackServer.Controllers
{
    [Authorize]
    [ApiVersion("1.0")]
    [Produces("application/json")]
    [Consumes("application/json")]
    public class ExtendedController : ControllerBase
    {
        protected readonly LocalDBContext _context;
        protected string _authIdentifier;
        protected ObjectResult _statusCode;

        public ExtendedController(LocalDBContext context)
        {
            _context = context;
        }

        protected void SetAuthIdentifierFromRequest()
        {
            _authIdentifier = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (_authIdentifier == null)
            {
                _statusCode = StatusCode(401, new
                {
                    header = "Authentication error",
                    subheader = "",
                    text = "NameIdentifier could was not extractable from access token."
                });
                throw new MissingAuthIdentifierException();
            }
        }
    }
}
