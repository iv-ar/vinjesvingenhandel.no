using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using VSH.Data;
using VSH.Data.Database;
using VSH.Data.Enums;

namespace VSH.Pages;

public class IndexModel : PageModel
{
	private readonly MainDbContext _context;

	public string ContactHtml { get; set; }
	public List<Product> HighlightedProducts { get; set; } = new();

	public IndexModel(MainDbContext context) {
		_context = context;
	}

	public ActionResult OnGet() {
		ContactHtml = _context.Documents.OrderBy(c => c.Created)
							  .LastOrDefault(c => c.Type == DocumentType.CONTACT_PAGE)
							  ?.Content;
		HighlightedProducts = _context.Products
									  .Where(c => c.ShowOnFrontpage
												  && c.VisibilityState == ProductVisibility.DEFAULT)
									  .Include(c => c.Category)
									  .ToList();
		return Page();
	}
}