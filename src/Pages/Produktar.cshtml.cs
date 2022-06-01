using System.Collections.Generic;
using System.IO;
using System.Linq;
using IOL.Helpers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using VSH.Data.Miscellaneous;
using VSH.Data.Database;
using VSH.Data;
using VSH.Data.Enums;
using VSH.Data.Static;

namespace VSH.Pages;

public class Produktar : PageModel
{
	private readonly MainDbContext _context;
	private readonly IStringLocalizer<SharedPageResources> _localizer;
	private readonly IOptions<AppSettings.GeneralConfiguration> _options;

	public string ProductSlug { get; set; }
	public string CategorySlug { get; set; }
	public bool IsProduct { get; set; }
	public bool IsCategory { get; set; }
	public bool IsCategories { get; set; }
	public Product CurrentProduct { get; set; }

	public Produktar(
			MainDbContext context,
			IStringLocalizer<SharedPageResources> localizer,
			IOptions<AppSettings.GeneralConfiguration> options
	) {
		_context = context;
		_localizer = localizer;
		_options = options;
	}

	public List<Category> Categories { get; set; }

	public ActionResult OnGet(string categorySlug, string productSlug) {
		ProductSlug = productSlug;
		CategorySlug = categorySlug;

		if (ProductSlug.HasValue()) {
			CurrentProduct = _context.Products.Where(c => c.VisibilityState == ProductVisibility.DEFAULT)
									 .Include(c => c.Category)
									 .SingleOrDefault(p => p.Slug == ProductSlug);
			IsProduct = CurrentProduct != default;
			if (!IsProduct)
				return Page();
			var productImage = CurrentProduct != null && CurrentProduct.Images.Any()
					? CurrentProduct.Images.OrderBy(c => c.Order).FirstOrDefault()
					: default;

			ViewData["open_graph"] = new OpenGraphData {
					Description = CurrentProduct?.Description,
					Image = productImage != default
							? (HttpContext.Request.GetRequestHost()
							   + Path.Combine(AppPaths.ProductImages.WebPath, productImage.FileName))
							: default,
					Title = $"{CurrentProduct?.Name} {_localizer["frå"]} {_options.Value.StoreName}",
			};
		} else if (CategorySlug.HasValue()) {
			Categories = _context
						 .Categories.Where(c => c.Slug == CategorySlug
												&& c.VisibilityState == CategoryVisibility.DEFAULT)
						 .Include(c => c.Products)
						 .ToList();
			IsCategory = !IsProduct && Categories?.Count == 1;
		} else {
			Categories = _context.Categories.Where(c => c.VisibilityState == CategoryVisibility.DEFAULT)
								 .Include(c => c.Products)
								 .ToList();
			IsCategories = !IsProduct && Categories?.Count >= 1;
		}

		return Page();
	}
}