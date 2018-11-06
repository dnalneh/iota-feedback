using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace FeedbackServer.Models
{
    public class Annotation
    {
        public int Id { get; set; }
        [Required]
        public Guid Guid { get; set; }
        public string Comment { get; set; }
        [Required]
        public int? Top { get; set; }
        [Required]
        public int? Left { get; set; }

        public IEnumerable<AnnotationRating> Ratings { get; set; }


        #region For referential integrity and cascade delete
        public int TicketId { get; set; }
        #endregion
    }
}
