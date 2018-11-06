using FeedbackServer.Models;
using Microsoft.EntityFrameworkCore;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FeedbackServer.Helper
{
    public static class QueryHelper
    {
        public static IQueryable<Domain> GetDomainsAuthenticatedQuery(LocalDBContext context, string authIdentifier)
        {
            return context.Domains.Where(d => d.UserAuthIdentifier == authIdentifier);
        }

        public static async Task<Domain> GetDomainByIDAuthenticatedAsync(LocalDBContext context, string authIdentifier, int id)
        {
            return await GetDomainsAuthenticatedQuery(context, authIdentifier).FirstOrDefaultAsync(d => d.Id == id);
        }

        public static IQueryable<Project> GetDomainProjectsAuthenticatedQuery(LocalDBContext context, string authIdentifier, int domainID)
        {
            return GetDomainsAuthenticatedQuery(context, authIdentifier)
                    .Where(d => d.Id == domainID)
                    .SelectMany(d => d.Projects);
        }

        public static IQueryable<Ticket> GetDomainProjectTicketsAuthenticatedQuery(LocalDBContext context, string authIdentifier, int domainID, int projectID)
        {
            return GetDomainProjectsAuthenticatedQuery(context, authIdentifier, domainID)
                    .Where(p => p.Id == projectID)
                    .SelectMany(p => p.Tickets);
        }

        public static IQueryable<AlternativesSelection> GetDomainProjectAlternativesSelectionsAuthenticatedQuery(LocalDBContext context, string authIdentifier, int domainID, int projectID)
        {
            return GetDomainProjectsAuthenticatedQuery(context, authIdentifier, domainID)
                    .Where(p => p.Id == projectID)
                    .SelectMany(p => p.AlternativesSelections);
        }
    }
}
