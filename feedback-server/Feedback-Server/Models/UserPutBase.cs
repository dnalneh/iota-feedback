using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FeedbackServer.Models
{
    public class UserPutBase : UserPostBase
    {
        public string IotaSeed { get; set; }
        public string IotaNode { get; set; }
    }
}
