using Microsoft.EntityFrameworkCore;
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
            // Singularize table name
            // Annotations => Annotation
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                entityType.Relational().TableName = entityType.Relational().TableName.Remove(entityType.Relational().TableName.Length - 1); // // you can also use NuGet package "Humanizer" to use entityType.Relational().TableName.Singularize()
            }

            // Add additional indizes

            modelBuilder.Entity<Ticket>().HasIndex(t => t.ViewGuid);
            modelBuilder.Entity<AlternativesSelection>().HasIndex(t => t.ViewGuid);
            modelBuilder.Entity<Annotation>().HasIndex(a => a.Guid);
            modelBuilder.Entity<Project>().HasIndex(p => p.Code);
            modelBuilder.Entity<Domain>().HasIndex(d => new { d.UserAuthIdentifier, d.Id });
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
