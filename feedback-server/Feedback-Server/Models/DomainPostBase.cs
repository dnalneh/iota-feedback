using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace FeedbackServer.Models
{
    /// <summary>
    /// The domain class for Model-Binding
    /// </summary>
    public class DomainPostBase
    {
        [Required]
        public string Url { get; set; }
    }
}
