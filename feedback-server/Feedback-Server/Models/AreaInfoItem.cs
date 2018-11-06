using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace FeedbackServer.Models
{
    public class AreaInfoItem
    {
        public int Id { get; set; }
        [Required]
        public string Name { get; set; }
        [Required]
        public string ChoosenItemTitle { get; set; }
        public string Comment { get; set; }

        #region For referential integrity and cascade delete
        public int AlternativesSelectionId { get; set; }
        #endregion
    }
}
