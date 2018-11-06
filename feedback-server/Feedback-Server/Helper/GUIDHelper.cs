using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FeedbackServer.Helper
{
    public class GUIDHelper
    {
        public static Guid CreateCryptographicallySecureGuid()
        {
            using (var provider = System.Security.Cryptography.RandomNumberGenerator.Create())
            {
                var bytes = new byte[16];
                provider.GetBytes(bytes);

                return new Guid(bytes);
            }
        }
    }
}
