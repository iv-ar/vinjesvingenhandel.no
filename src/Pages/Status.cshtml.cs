using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using VSH.Data;
using VSH.Data.Database;

namespace VSH.Pages;

public class Status : PageModel
{
	private readonly MainDbContext _context;
	public Order CurrentOrder { get; private set; }
	public List<StatusProduct> CurrentOrderProducts { get; }

	public Status(MainDbContext context) {
		_context = context;
		CurrentOrderProducts = new List<StatusProduct>();
	}

	public ActionResult OnGet(string orderReference) {
		try {
			CurrentOrder = _context.Orders.SingleOrDefault(o => o.OrderReference == orderReference);
			if (CurrentOrder == default) return Page();

			foreach (var orderProduct in CurrentOrder.Products) {
				var dbProduct = _context.Products.Include(c => c.Category)
										.SingleOrDefault(p => p.Id == orderProduct.Id);
				if (dbProduct == default) continue;
				CurrentOrderProducts.Add(new StatusProduct(dbProduct, orderProduct));
			}

			return Page();
		} catch (Exception e) {
			Console.WriteLine(e);
		}

		return Redirect("/errors/500");
	}

	public class StatusProduct
	{
		public StatusProduct(Product dbProdcut, OrderProduct orderProduct) {
			DbProdcut = dbProdcut;
			OrderProduct = orderProduct;
		}

		public Product DbProdcut { get; }
		public OrderProduct OrderProduct { get; }
	}
}