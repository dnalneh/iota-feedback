using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace FeedbackServer.Models
{
    public class Project : ProjectPostAndPutBase
    {
        public int Id { get; set; }
        public Guid Code { get; set; }
        public IEnumerable<Ticket> Tickets { get; set; }
        public IEnumerable<AlternativesSelection> AlternativesSelections { get; set; }


        #region For referential integrity and cascade delete
        public int DomainId { get; set; }
        #endregion
    }
}
