using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace FeedbackServer.Migrations
{
    public partial class InitialCreate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "User",
                columns: table => new
                {
                    Email = table.Column<string>(nullable: false),
                    IotaSeed = table.Column<string>(nullable: true),
                    IotaNode = table.Column<string>(nullable: true),
                    AuthIdentifier = table.Column<string>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_User", x => x.AuthIdentifier);
                });

            migrationBuilder.CreateTable(
                name: "Domain",
                columns: table => new
                {
                    Url = table.Column<string>(nullable: false),
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    UserAuthIdentifier = table.Column<string>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Domain", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Domain_User_UserAuthIdentifier",
                        column: x => x.UserAuthIdentifier,
                        principalTable: "User",
                        principalColumn: "AuthIdentifier",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Project",
                columns: table => new
                {
                    Name = table.Column<string>(nullable: false),
                    Description = table.Column<string>(nullable: true),
                    NotificationEmail = table.Column<string>(nullable: false),
                    IsPaused = table.Column<bool>(nullable: false),
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Code = table.Column<Guid>(nullable: false),
                    DomainId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Project", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Project_Domain_DomainId",
                        column: x => x.DomainId,
                        principalTable: "Domain",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AlternativesSelection",
                columns: table => new
                {
                    Name = table.Column<string>(nullable: true),
                    Email = table.Column<string>(nullable: true),
                    IotaAddress = table.Column<string>(nullable: true),
                    Url = table.Column<string>(nullable: false),
                    Sent = table.Column<string>(nullable: false),
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    ViewGuid = table.Column<Guid>(nullable: false),
                    ViewedAt = table.Column<string>(nullable: true),
                    IotaTransactionHash = table.Column<string>(nullable: true),
                    ProjectId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AlternativesSelection", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AlternativesSelection_Project_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Project",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Ticket",
                columns: table => new
                {
                    Closed = table.Column<bool>(nullable: false),
                    Name = table.Column<string>(nullable: true),
                    Email = table.Column<string>(nullable: true),
                    IotaAddress = table.Column<string>(nullable: true),
                    NavigatorString = table.Column<string>(nullable: false),
                    BrowserFontSize = table.Column<string>(nullable: false),
                    ScreenHeight = table.Column<int>(nullable: false),
                    ScreenWidth = table.Column<int>(nullable: false),
                    Url = table.Column<string>(nullable: false),
                    Sent = table.Column<string>(nullable: false),
                    IsPublic = table.Column<bool>(nullable: false),
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    ViewGuid = table.Column<Guid>(nullable: false),
                    ViewedAt = table.Column<string>(nullable: true),
                    IotaTransactionHash = table.Column<string>(nullable: true),
                    ProjectId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ticket", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Ticket_Project_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Project",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AlternativesSelectionSharing",
                columns: table => new
                {
                    Email = table.Column<string>(nullable: false),
                    Sent = table.Column<string>(nullable: false),
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    AlternativesSelectionId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AlternativesSelectionSharing", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AlternativesSelectionSharing_AlternativesSelection_AlternativesSelectionId",
                        column: x => x.AlternativesSelectionId,
                        principalTable: "AlternativesSelection",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AreaInfoItem",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(nullable: false),
                    ChoosenItemTitle = table.Column<string>(nullable: false),
                    Comment = table.Column<string>(nullable: true),
                    AlternativesSelectionId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AreaInfoItem", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AreaInfoItem_AlternativesSelection_AlternativesSelectionId",
                        column: x => x.AlternativesSelectionId,
                        principalTable: "AlternativesSelection",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Annotation",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Guid = table.Column<Guid>(nullable: false),
                    Comment = table.Column<string>(nullable: true),
                    Top = table.Column<int>(nullable: false),
                    Left = table.Column<int>(nullable: false),
                    TicketId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Annotation", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Annotation_Ticket_TicketId",
                        column: x => x.TicketId,
                        principalTable: "Ticket",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TicketSharing",
                columns: table => new
                {
                    Email = table.Column<string>(nullable: false),
                    Sent = table.Column<string>(nullable: false),
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    TicketId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TicketSharing", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TicketSharing_Ticket_TicketId",
                        column: x => x.TicketId,
                        principalTable: "Ticket",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AnnotationRating",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    RateValue = table.Column<int>(nullable: false),
                    AnnotationId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AnnotationRating", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AnnotationRating_Annotation_AnnotationId",
                        column: x => x.AnnotationId,
                        principalTable: "Annotation",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AlternativesSelection_ProjectId",
                table: "AlternativesSelection",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_AlternativesSelection_ViewGuid",
                table: "AlternativesSelection",
                column: "ViewGuid");

            migrationBuilder.CreateIndex(
                name: "IX_AlternativesSelectionSharing_AlternativesSelectionId",
                table: "AlternativesSelectionSharing",
                column: "AlternativesSelectionId");

            migrationBuilder.CreateIndex(
                name: "IX_Annotation_Guid",
                table: "Annotation",
                column: "Guid");

            migrationBuilder.CreateIndex(
                name: "IX_Annotation_TicketId",
                table: "Annotation",
                column: "TicketId");

            migrationBuilder.CreateIndex(
                name: "IX_AnnotationRating_AnnotationId",
                table: "AnnotationRating",
                column: "AnnotationId");

            migrationBuilder.CreateIndex(
                name: "IX_AreaInfoItem_AlternativesSelectionId",
                table: "AreaInfoItem",
                column: "AlternativesSelectionId");

            migrationBuilder.CreateIndex(
                name: "IX_Domain_UserAuthIdentifier_Id",
                table: "Domain",
                columns: new[] { "UserAuthIdentifier", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_Project_Code",
                table: "Project",
                column: "Code");

            migrationBuilder.CreateIndex(
                name: "IX_Project_DomainId",
                table: "Project",
                column: "DomainId");

            migrationBuilder.CreateIndex(
                name: "IX_Ticket_ProjectId",
                table: "Ticket",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Ticket_ViewGuid",
                table: "Ticket",
                column: "ViewGuid");

            migrationBuilder.CreateIndex(
                name: "IX_TicketSharing_TicketId",
                table: "TicketSharing",
                column: "TicketId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AlternativesSelectionSharing");

            migrationBuilder.DropTable(
                name: "AnnotationRating");

            migrationBuilder.DropTable(
                name: "AreaInfoItem");

            migrationBuilder.DropTable(
                name: "TicketSharing");

            migrationBuilder.DropTable(
                name: "Annotation");

            migrationBuilder.DropTable(
                name: "AlternativesSelection");

            migrationBuilder.DropTable(
                name: "Ticket");

            migrationBuilder.DropTable(
                name: "Project");

            migrationBuilder.DropTable(
                name: "Domain");

            migrationBuilder.DropTable(
                name: "User");
        }
    }
}
