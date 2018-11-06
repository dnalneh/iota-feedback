using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace FeedbackServer.Models
{
    public class AnnotationRating
    {
        public int Id { get; set; }
        [Required]
        public int? RateValue { get; set; }


        #region For referential integrity and cascade delete
        public int AnnotationId { get; set; }
        #endregion
    }
}
