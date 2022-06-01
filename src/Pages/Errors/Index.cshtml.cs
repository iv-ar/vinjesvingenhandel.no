using System;
using System.Net;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace VSH.Pages.Errors;

public class Index : PageModel
{
	public HttpStatusCode ErrorStatusCode { get; set; }

	public void OnGet() {
		try {
			if (int.TryParse(RouteData.Values["code"]?.ToString(), out var status))
				ErrorStatusCode = (HttpStatusCode)status;
		} catch (Exception e) {
			Console.WriteLine(e);
		}
	}
}