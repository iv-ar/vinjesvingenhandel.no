using System.Linq;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using VSH.Data;
using VSH.Data.Enums;

namespace VSH.Pages;

public class SalesTerms : PageModel
{
	private readonly MainDbContext _context;

	public SalesTerms(MainDbContext context) {
		context.ChangeTracker.QueryTrackingBehavior = QueryTrackingBehavior.NoTracking;
		_context = context;
	}

	public string TermsPageHtml { get; set; }

	public void OnGet() {
		TermsPageHtml = _context.Documents.OrderBy(c => c.Created)
								.LastOrDefault(c => c.Type == DocumentType.SALES_TERMS)
								?.Content;
	}
}