using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace FeedbackServer.Helper
{
    public class IOTAHelper
    {
        static readonly int AddressLength_WithoutChecksum = 81;
        static readonly int AddressLength_WithChecksum = 90;

        public static bool IsAddress(string address)
        {
            if (address.Length == AddressLength_WithoutChecksum ||
                address.Length == AddressLength_WithChecksum)
            {
                return IsTrytes(address, address.Length);
            }
            return false;
        }

        public static bool IsTrytes(string trytes, int length)
        {
            string regex = "^[9A-Z]{" + (length == 0 ? "0," : length.ToString()) + "}$";
            var regexTrytes = new Regex(regex);
            return regexTrytes.IsMatch(trytes);
        }
    }
}
