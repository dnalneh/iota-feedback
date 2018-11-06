using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace FeedbackServer.Models
{
    public class AlternativesSelectionSharing : SharingPutBase
    {
        public int Id { get; set; }


        #region For referential integrity and cascade delete
        public int AlternativesSelectionId { get; set; }
        #endregion
    }
}
