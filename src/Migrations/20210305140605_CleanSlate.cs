using System;
using System.Collections.Generic;
using IOL.VippsEcommerce.Models.Api;
using Microsoft.EntityFrameworkCore.Migrations;
using VSH.Data.Database;

namespace VSH.Migrations
{
    public partial class CleanSlate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: true),
                    slug = table.Column<string>(type: "text", nullable: true),
                    visibility_state = table.Column<int>(type: "integer", nullable: false),
                    created = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    updated = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_categories", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Documents",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    type = table.Column<int>(type: "integer", nullable: false),
                    content = table.Column<string>(type: "text", nullable: true),
                    created = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    updated = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_documents", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Orders",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    comment = table.Column<string>(type: "text", nullable: true),
                    order_reference = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<int>(type: "integer", nullable: false),
                    payment_type = table.Column<int>(type: "integer", nullable: false),
                    contact_info = table.Column<Order.ContactInformation>(type: "jsonb", nullable: true),
                    products = table.Column<List<OrderProduct>>(type: "jsonb", nullable: true),
                    created = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    updated = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_orders", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    username = table.Column<string>(type: "text", nullable: true),
                    password = table.Column<string>(type: "text", nullable: true),
                    created = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    updated = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_users", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    price = table.Column<decimal>(type: "numeric", nullable: false),
                    price_suffix = table.Column<int>(type: "integer", nullable: false),
                    visibility_state = table.Column<int>(type: "integer", nullable: false),
                    category_id = table.Column<Guid>(type: "uuid", nullable: true),
                    images = table.Column<List<ProductImage>>(type: "jsonb", nullable: true),
                    count = table.Column<int>(type: "integer", nullable: false),
                    slug = table.Column<string>(type: "text", nullable: true),
                    show_on_frontpage = table.Column<bool>(type: "boolean", nullable: false),
                    created = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    updated = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_products", x => x.id);
                    table.ForeignKey(
                        name: "fk_products_categories_category_id",
                        column: x => x.category_id,
                        principalTable: "Categories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
               name: "VippsResponses",
               columns: table => new
               {
                   id = table.Column<Guid>(type: "uuid", nullable: false),
                   order_id = table.Column<Guid>(type: "uuid", nullable: false),
                   status_code = table.Column<int>(type: "integer", nullable: false),
                   initiation_response = table.Column<VippsPaymentInitiationCallbackResponse>(type: "jsonb", nullable: true),
                   payment_detail_response = table.Column<VippsGetPaymentDetailsResponse>(type: "jsonb", nullable: true),
                   cancellation_response = table.Column<VippsPaymentActionResponse>(type: "jsonb", nullable: true),
                   refund_response = table.Column<VippsPaymentActionResponse>(type: "jsonb", nullable: true),
                   capture_response = table.Column<VippsPaymentActionResponse>(type: "jsonb", nullable: true),
                   error_response = table.Column<VippsErrorResponse>(type: "jsonb", nullable: true),
                   created = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
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
                name: "ix_products_category_id",
                table: "Products",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "ix_vipps_responses_order_id",
                table: "VippsResponses",
                column: "order_id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Documents");

            migrationBuilder.DropTable(
                name: "Products");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "VippsResponses");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropTable(
                name: "Orders");
        }
    }
}
