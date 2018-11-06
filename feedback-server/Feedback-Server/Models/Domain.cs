using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace FeedbackServer.Models
{
    public class Domain : DomainPostBase
    {
        public int Id { get; set; }
        public IEnumerable<Project> Projects { get; set; }

        #region For referential integrity and cascade delete
        [Required]
        public string UserAuthIdentifier { get; set; } // this is the foreign key navigation property
        public User User { get; set; }
        #endregion

    }
}
