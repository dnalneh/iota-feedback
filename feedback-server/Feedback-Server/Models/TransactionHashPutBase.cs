using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace FeedbackServer.Models
{
    public class TransactionHashPutBase
    {
        [Required]
        public string TransactionHash { get; set; }
        [Required]
        public bool ForceOverwrite { get; set; }
    }
}
