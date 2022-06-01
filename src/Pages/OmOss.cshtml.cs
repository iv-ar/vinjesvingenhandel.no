using System.Linq;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using VSH.Data;
using VSH.Data.Enums;

namespace VSH.Pages;

public class OmOss : PageModel
{
	private readonly MainDbContext _context;

	public OmOss(MainDbContext context) {
		context.ChangeTracker.QueryTrackingBehavior = QueryTrackingBehavior.NoTracking;
		_context = context;
	}

	public string AboutUsPageHtml { get; set; }

	public void OnGet() {
		AboutUsPageHtml = _context.Documents.FirstOrDefault(c => c.Type == DocumentType.ABOUT_PAGE)?.Content;
	}
}