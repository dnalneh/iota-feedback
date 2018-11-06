using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace FeedbackServer.Models
{
    public class TicketPostBase : TicketPutBase
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string IotaAddress { get; set; }
        [Required]
        public string NavigatorString { get; set; }
        [Required]
        public string BrowserFontSize { get; set; }
        [Required]
        public int? ScreenHeight { get; set; } // nullable int is important, otherwise it will be automatically set = 0 and then, there is no invalid modelstate!
        [Required]
        public int? ScreenWidth { get; set; }
        [Required]
        public string Url { get; set; }
        public IEnumerable<Annotation> Annotations { get; set; }
        [Required]
        public string Sent { get; set; } // Format: http://en.wikipedia.org/wiki/ISO_8601
        [Required]
        public bool IsPublic { get; set; }
    }
}
