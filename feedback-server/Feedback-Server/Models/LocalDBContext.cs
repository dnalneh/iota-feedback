using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;


// Model First:

// If there are changes, open Package-Manager Console and type:
//PM> Add-Migration newthings     -> newthings is just a name
// then
//PM> Update-Database

// Info: If you add a new table, you have to add it below, for example: public DbSet<Annotation> Annotations { get; set; }

namespace FeedbackServer.Models
{
    public class LocalDBContext : DbContext
    {
        public LocalDBContext(DbContextOptions<LocalDBContext> options)
                : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Add additional indizes
            modelBuilder.Entity<Ticket>().HasIndex(t => t.ViewGuid);
            modelBuilder.Entity<AlternativesSelection>().HasIndex(t => t.ViewGuid);
            modelBuilder.Entity<Annotation>().HasIndex(a => a.Guid);
            modelBuilder.Entity<Project>().HasIndex(p => p.Code);
            modelBuilder.Entity<Domain>().HasIndex(d => new { d.UserAuthIdentifier, d.Id });

            // Singularize table name
            // Annotations => Annotation
            foreach (IMutableEntityType entity in modelBuilder.Model.GetEntityTypes())
            {
                if (!entity.IsOwned())
                {
                    entity.SetTableName(entity.ClrType.Name);
                }
            }
        }

        public DbSet<Annotation> Annotations { get; set; }
        public DbSet<AnnotationRating> AnnotationRatings { get; set; }
        public DbSet<Ticket> Tickets { get; set; }
        public DbSet<TicketSharing> TicketSharings { get; set; }
        public DbSet<Domain> Domains { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<AlternativesSelection> AlternativesSelections { get; set; }
        public DbSet<AlternativesSelectionSharing> AlternativesSelectionSharings { get; set; }
        public DbSet<AreaInfoItem> AreaInfoItems { get; set; }
    }
}
