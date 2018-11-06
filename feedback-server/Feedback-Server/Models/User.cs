using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace FeedbackServer.Models
{
    public class User : UserPutBase
    {
        [Key]
        public string AuthIdentifier { get; set; }

        [ForeignKey("UserAuthIdentifier")]
        public IEnumerable<Domain> Domains { get; set; }
    }
}
