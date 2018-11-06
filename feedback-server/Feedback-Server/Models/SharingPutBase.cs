using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace FeedbackServer.Models
{
    public class SharingPutBase
    {
        [Required]
        public string Email { get; set; }
        [Required]
        public string Sent { get; set; } // Format: http://en.wikipedia.org/wiki/ISO_8601
    }
}
