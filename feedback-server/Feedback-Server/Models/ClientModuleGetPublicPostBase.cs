﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace FeedbackServer.Models
{
    public class ClientModuleGetPublicPostBase
    {
        [Required]
        public string Url { get; set; }
    }
}
