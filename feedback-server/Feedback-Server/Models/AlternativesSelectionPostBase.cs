using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace FeedbackServer.Models
{
    public class AlternativesSelectionPostBase
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string IotaAddress { get; set; }
        [Required]
        public string Url { get; set; }
        public IEnumerable<AreaInfoItem> AreaInfoItems { get; set; }
        [Required]
        public string Sent { get; set; } // Format: http://en.wikipedia.org/wiki/ISO_8601
    }
}
