using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace FeedbackServer.Models
{
    public class ProjectPostAndPutBase
    {
        [Required]
        public string Name { get; set; }
        public string Description { get; set; }
        [Required]
        public string NotificationEmail { get; set; }
        [Required]
        public bool IsPaused { get; set; }
    }
}
