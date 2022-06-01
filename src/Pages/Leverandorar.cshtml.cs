using System.Linq;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using VSH.Data;
using VSH.Data.Enums;

namespace VSH.Pages;

public class Leverandorar : PageModel
{
	private readonly MainDbContext _context;

	public Leverandorar(MainDbContext context) {
		context.ChangeTracker.QueryTrackingBehavior = QueryTrackingBehavior.NoTracking;
		_context = context;
	}

	public string DealersPageHtml { get; set; }

	public void OnGet() {
		DealersPageHtml = _context.Documents.FirstOrDefault(c => c.Type == DocumentType.DEALERS_PAGE)?.Content;
	}
}