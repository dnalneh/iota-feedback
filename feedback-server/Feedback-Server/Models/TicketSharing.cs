using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FeedbackServer.Models
{
    public class TicketSharing : SharingPutBase
    {
        public int Id { get; set; }


        #region For referential integrity and cascade delete
        public int TicketId { get; set; }
        #endregion
    }
}
