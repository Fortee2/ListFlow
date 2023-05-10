using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ListFlow.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Intial_Create : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Inventory",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false),
                    Name = table.Column<string>(type: "longtext", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Cost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Weight = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Inventory", x => x.Id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "LoginActivity",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false),
                    LastLoggedInDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    LastFailedDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    NumberOfAttempts = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<Guid>(type: "char(36)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoginActivity", x => x.Id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "MasterAccount",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false),
                    Name = table.Column<string>(type: "longtext", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MasterAccount", x => x.Id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "SalesChannel",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false),
                    Name = table.Column<string>(type: "longtext", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SalesChannel", x => x.Id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "User",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false),
                    FirstName = table.Column<string>(type: "longtext", nullable: false),
                    LastName = table.Column<string>(type: "longtext", nullable: false),
                    Email = table.Column<string>(type: "longtext", nullable: false),
                    HashedPassword = table.Column<string>(type: "longtext", nullable: false),
                    MasterAccountId = table.Column<Guid>(type: "char(36)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_User", x => x.Id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Listing",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false),
                    ItemNumber = table.Column<string>(type: "longtext", nullable: false),
                    ItemTitle = table.Column<string>(type: "longtext", nullable: false),
                    Description = table.Column<string>(type: "longtext", nullable: false),
                    InventoryId = table.Column<Guid>(type: "char(36)", nullable: false),
                    SalesChannelId = table.Column<Guid>(type: "char(36)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Listing", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Listing_Inventory_InventoryId",
                        column: x => x.InventoryId,
                        principalTable: "Inventory",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Listing_SalesChannel_SalesChannelId",
                        column: x => x.SalesChannelId,
                        principalTable: "SalesChannel",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Listing_InventoryId",
                table: "Listing",
                column: "InventoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Listing_SalesChannelId",
                table: "Listing",
                column: "SalesChannelId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Listing");

            migrationBuilder.DropTable(
                name: "LoginActivity");

            migrationBuilder.DropTable(
                name: "MasterAccount");

            migrationBuilder.DropTable(
                name: "User");

            migrationBuilder.DropTable(
                name: "Inventory");

            migrationBuilder.DropTable(
                name: "SalesChannel");
        }
    }
}
