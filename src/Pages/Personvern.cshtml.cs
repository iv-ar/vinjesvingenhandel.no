using System.Linq;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using VSH.Data;
using VSH.Data.Enums;

namespace VSH.Pages;

public class PrivacyModel : PageModel
{
	private readonly MainDbContext _context;

	public PrivacyModel(MainDbContext context) {
		context.ChangeTracker.QueryTrackingBehavior = QueryTrackingBehavior.NoTracking;
		_context = context;
	}

	public string PrivacyPolicyHtml { get; set; }

	public void OnGet() {
		PrivacyPolicyHtml = _context.Documents.OrderBy(c => c.Created)
									.LastOrDefault(c => c.Type == DocumentType.PRIVACY_POLICY)
									?.Content;
	}
}