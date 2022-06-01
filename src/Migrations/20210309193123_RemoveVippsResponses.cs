using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace VSH.Migrations
{
    public partial class RemoveVippsResponses : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "VippsResponses");

            migrationBuilder.AddColumn<int>(
                name: "vipps_status",
                table: "Orders",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "vipps_transaction_id",
                table: "Orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "vipps_transaction_status",
                table: "Orders",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "vipps_status",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "vipps_transaction_id",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "vipps_transaction_status",
                table: "Orders");

            migrationBuilder.CreateTable(
                name: "VippsResponses",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    cancellation_response = table.Column<string>(type: "jsonb", nullable: true),
                    capture_response = table.Column<string>(type: "jsonb", nullable: true),
                    created = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    error_response = table.Column<string>(type: "jsonb", nullable: true),
                    initiation_response = table.Column<string>(type: "jsonb", nullable: true),
                    order_id = table.Column<Guid>(type: "uuid", nullable: false),
                    payment_detail_response = table.Column<string>(type: "jsonb", nullable: true),
                    refund_response = table.Column<string>(type: "jsonb", nullable: true),
                    status_code = table.Column<int>(type: "integer", nullable: false),
                    updated = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_vipps_responses", x => x.id);
                    table.ForeignKey(
                        name: "fk_vipps_responses_orders_order_id",
                        column: x => x.order_id,
                        principalTable: "Orders",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_vipps_responses_order_id",
                table: "VippsResponses",
                column: "order_id");
        }
    }
}
