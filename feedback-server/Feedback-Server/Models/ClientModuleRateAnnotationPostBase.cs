using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace FeedbackServer.Models
{
    public class ClientModuleRateAnnotationPostBase
    {
        [Required]
        public Guid Guid { get; set; }
        [Required]
        public int? RateValue { get; set; }
    }
}
