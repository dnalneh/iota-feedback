using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace FeedbackServer.Hubs
{
    public class NewFeedbackHub : Hub
    {
        // neccessary but empty, because no action is executed from the client
    }
}
