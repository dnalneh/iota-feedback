using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace FeedbackServer.Helper
{
    public class UrlHelper
    {
        public static string NormalizeUrl(string origin)
        {
            string url = Regex.Replace(origin, @"^(?:http(?:s)?://)?(?:www(?:[0-9]+)?\.)?", string.Empty, RegexOptions.IgnoreCase);

            if (url.EndsWith("/"))
            {
                url = url.Remove(url.Length - 1);
            }

            return url;
        }
    }
}
