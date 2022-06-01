using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace VSH.Pages;

public class LoggInn : PageModel
{
	public ActionResult OnGet() {
		if (User.Identity?.IsAuthenticated ?? false) {
			if (Request.Query.ContainsKey("ReturnUrl")) {
				return Redirect(Request.Query["ReturnUrl"]);
			}

			return Redirect("/kontoret");
		}

		return Page();
	}
}