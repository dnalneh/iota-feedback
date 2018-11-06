﻿// <auto-generated />
using System;
using FeedbackServer.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace FeedbackServer.Migrations
{
    [DbContext(typeof(LocalDBContext))]
    [Migration("20181101123847_InitialCreate")]
    partial class InitialCreate
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "2.1.4-rtm-31024")
                .HasAnnotation("Relational:MaxIdentifierLength", 128)
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("FeedbackServer.Models.AlternativesSelection", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("Email");

                    b.Property<string>("IotaAddress");

                    b.Property<string>("IotaTransactionHash");

                    b.Property<string>("Name");

                    b.Property<int>("ProjectId");

                    b.Property<string>("Sent")
                        .IsRequired();

                    b.Property<string>("Url")
                        .IsRequired();

                    b.Property<Guid>("ViewGuid");

                    b.Property<string>("ViewedAt");

                    b.HasKey("Id");

                    b.HasIndex("ProjectId");

                    b.HasIndex("ViewGuid");

                    b.ToTable("AlternativesSelection");
                });

            modelBuilder.Entity("FeedbackServer.Models.AlternativesSelectionSharing", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int>("AlternativesSelectionId");

                    b.Property<string>("Email")
                        .IsRequired();

                    b.Property<string>("Sent")
                        .IsRequired();

                    b.HasKey("Id");

                    b.HasIndex("AlternativesSelectionId");

                    b.ToTable("AlternativesSelectionSharing");
                });

            modelBuilder.Entity("FeedbackServer.Models.Annotation", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("Comment");

                    b.Property<Guid>("Guid");

                    b.Property<int?>("Left")
                        .IsRequired();

                    b.Property<int>("TicketId");

                    b.Property<int?>("Top")
                        .IsRequired();

                    b.HasKey("Id");

                    b.HasIndex("Guid");

                    b.HasIndex("TicketId");

                    b.ToTable("Annotation");
                });

            modelBuilder.Entity("FeedbackServer.Models.AnnotationRating", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int>("AnnotationId");

                    b.Property<int?>("RateValue")
                        .IsRequired();

                    b.HasKey("Id");

                    b.HasIndex("AnnotationId");

                    b.ToTable("AnnotationRating");
                });

            modelBuilder.Entity("FeedbackServer.Models.AreaInfoItem", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int>("AlternativesSelectionId");

                    b.Property<string>("ChoosenItemTitle")
                        .IsRequired();

                    b.Property<string>("Comment");

                    b.Property<string>("Name")
                        .IsRequired();

                    b.HasKey("Id");

                    b.HasIndex("AlternativesSelectionId");

                    b.ToTable("AreaInfoItem");
                });

            modelBuilder.Entity("FeedbackServer.Models.Domain", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("Url")
                        .IsRequired();

                    b.Property<string>("UserAuthIdentifier")
                        .IsRequired();

                    b.HasKey("Id");

                    b.HasIndex("UserAuthIdentifier", "Id");

                    b.ToTable("Domain");
                });

            modelBuilder.Entity("FeedbackServer.Models.Project", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<Guid>("Code");

                    b.Property<string>("Description");

                    b.Property<int>("DomainId");

                    b.Property<bool>("IsPaused");

                    b.Property<string>("Name")
                        .IsRequired();

                    b.Property<string>("NotificationEmail")
                        .IsRequired();

                    b.HasKey("Id");

                    b.HasIndex("Code");

                    b.HasIndex("DomainId");

                    b.ToTable("Project");
                });

            modelBuilder.Entity("FeedbackServer.Models.Ticket", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("BrowserFontSize")
                        .IsRequired();

                    b.Property<bool>("Closed");

                    b.Property<string>("Email");

                    b.Property<string>("IotaAddress");

                    b.Property<string>("IotaTransactionHash");

                    b.Property<bool>("IsPublic");

                    b.Property<string>("Name");

                    b.Property<string>("NavigatorString")
                        .IsRequired();

                    b.Property<int>("ProjectId");

                    b.Property<int?>("ScreenHeight")
                        .IsRequired();

                    b.Property<int?>("ScreenWidth")
                        .IsRequired();

                    b.Property<string>("Sent")
                        .IsRequired();

                    b.Property<string>("Url")
                        .IsRequired();

                    b.Property<Guid>("ViewGuid");

                    b.Property<string>("ViewedAt");

                    b.HasKey("Id");

                    b.HasIndex("ProjectId");

                    b.HasIndex("ViewGuid");

                    b.ToTable("Ticket");
                });

            modelBuilder.Entity("FeedbackServer.Models.TicketSharing", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("Email")
                        .IsRequired();

                    b.Property<string>("Sent")
                        .IsRequired();

                    b.Property<int>("TicketId");

                    b.HasKey("Id");

                    b.HasIndex("TicketId");

                    b.ToTable("TicketSharing");
                });

            modelBuilder.Entity("FeedbackServer.Models.User", b =>
                {
                    b.Property<string>("AuthIdentifier")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Email")
                        .IsRequired();

                    b.Property<string>("IotaNode");

                    b.Property<string>("IotaSeed");

                    b.HasKey("AuthIdentifier");

                    b.ToTable("User");
                });

            modelBuilder.Entity("FeedbackServer.Models.AlternativesSelection", b =>
                {
                    b.HasOne("FeedbackServer.Models.Project")
                        .WithMany("AlternativesSelections")
                        .HasForeignKey("ProjectId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("FeedbackServer.Models.AlternativesSelectionSharing", b =>
                {
                    b.HasOne("FeedbackServer.Models.AlternativesSelection")
                        .WithMany("Sharings")
                        .HasForeignKey("AlternativesSelectionId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("FeedbackServer.Models.Annotation", b =>
                {
                    b.HasOne("FeedbackServer.Models.Ticket")
                        .WithMany("Annotations")
                        .HasForeignKey("TicketId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("FeedbackServer.Models.AnnotationRating", b =>
                {
                    b.HasOne("FeedbackServer.Models.Annotation")
                        .WithMany("Ratings")
                        .HasForeignKey("AnnotationId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("FeedbackServer.Models.AreaInfoItem", b =>
                {
                    b.HasOne("FeedbackServer.Models.AlternativesSelection")
                        .WithMany("AreaInfoItems")
                        .HasForeignKey("AlternativesSelectionId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("FeedbackServer.Models.Domain", b =>
                {
                    b.HasOne("FeedbackServer.Models.User", "User")
                        .WithMany("Domains")
                        .HasForeignKey("UserAuthIdentifier")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("FeedbackServer.Models.Project", b =>
                {
                    b.HasOne("FeedbackServer.Models.Domain")
                        .WithMany("Projects")
                        .HasForeignKey("DomainId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("FeedbackServer.Models.Ticket", b =>
                {
                    b.HasOne("FeedbackServer.Models.Project")
                        .WithMany("Tickets")
                        .HasForeignKey("ProjectId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("FeedbackServer.Models.TicketSharing", b =>
                {
                    b.HasOne("FeedbackServer.Models.Ticket")
                        .WithMany("Sharings")
                        .HasForeignKey("TicketId")
                        .OnDelete(DeleteBehavior.Cascade);
                });
#pragma warning restore 612, 618
        }
    }
}
