using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FeedbackServer.Models
{
    public class Ticket : TicketPostBase
    {
        public int Id { get; set; }
        public Guid ViewGuid { get; set; }
        public string ViewedAt { get; set; } // Format: http://en.wikipedia.org/wiki/ISO_8601
        public string IotaTransactionHash { get; set; } // if not null than payment is done

        public IEnumerable<TicketSharing> Sharings { get; set; }

        #region For referential integrity and cascade delete
        public int ProjectId { get; set; }
        #endregion
    }
}
