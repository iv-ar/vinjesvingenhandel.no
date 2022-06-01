using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using IOL.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using VSH.Data;
using VSH.Data.Database;
using VSH.Data.Enums;
using VSH.Data.Results;
using VSH.Data.Static;
using VSH.Utilities;

namespace VSH.Controllers;

[Authorize]
public class ProductsController : MainControllerBase
{
	private readonly MainDbContext _context;
	private readonly IStringLocalizer<SharedControllerResources> _localizer;

	public ProductsController(
			MainDbContext context,
			IStringLocalizer<SharedControllerResources> localizer
	) {
		_context = context;
		_localizer = localizer;
	}

	[HttpGet]
	[AllowAnonymous]
	public ActionResult GetAllProducts() {
		return Ok(_context.Products.Include(c => c.Category));
	}

	[HttpGet("{id}")]
	[AllowAnonymous]
	public Product GetProduct(Guid id) {
		return _context.Products
					   .Include(c => c.Category)
					   .SingleOrDefault(c => c.Id == id);
	}

	[HttpPost("upload-images")]
	public ActionResult UploadImages() {
		if (Request.Form.Files.Count == 0)
			return BadRequest();
		var filePaths = new List<FileInfo>();
		var fileNames = new List<string>();
		foreach (var file in Request.Form.Files) {
			var fileName = RandomString.Generate(8, true) + file.FileName.ExtractExtension();
			var filePath = Path.Combine(AppPaths.ProductImages.HostPath, fileName);
			using var writeStream = new FileStream(filePath, FileMode.CreateNew);
			file.CopyTo(writeStream);
			filePaths.Add(new FileInfo(filePath));
			fileNames.Add(fileName);
		}

		foreach (var filePath in filePaths) {
			ImageFunctions.CreateProductImageCollection(filePath);
		}

		return Ok(fileNames);
	}

	[HttpPost("create")]
	public ActionResult CreateProductAsync(Product payload) {
		payload.SetBaseValues();
		var category = _context.Categories.SingleOrDefault(p => p.Id == payload.Category.Id);
		if (category == default)
			return BadRequest(new ErrorResult(_localizer["Kunne ikke finne kategorien"]));
		payload.Category = category;
		payload.Slug = payload.Name.Slugified();
		_context.Products.Add(payload);
		_context.SaveChanges();
		return Ok();
	}


	[HttpPost("{id}/update")]
	public ActionResult UpdateProductAsync([FromRoute] Guid id, [FromBody] Product payload) {
		var product = _context.Products.SingleOrDefault(p => p.Id == id);
		if (product == default)
			return NotFound(new ErrorResult(_localizer["Kunne ikke finne produktet"]));
		var category = _context.Categories.AsNoTracking().SingleOrDefault(c => c.Id == payload.Category.Id);
		if (category == default)
			return NotFound(new ErrorResult(_localizer["Kunne ikke finne kategorien"]));

		var newImages = payload.Images.Select(c => new ProductImage(c.FileName, c.Order)).ToList();

		product.Images = newImages;
		product.Category = category;
		product.Name = payload.Name;
		product.Slug = product.Name.Slugified();
		product.Description = payload.Description;
		product.Price = payload.Price;
		product.Count = payload.Count;
		product.PriceSuffix = payload.PriceSuffix;
		product.ShowOnFrontpage = payload.ShowOnFrontpage;
		product.Updated = DateTime.UtcNow;
		_context.SaveChanges();

		return Ok();
	}

	[HttpDelete("{id}/delete")]
	public ActionResult DeleteProductAsync(Guid id) {
		var product = _context.Products.SingleOrDefault(p => p.Id == id);
		if (product == default)
			return NotFound(new ErrorResult(_localizer["Kunne ikke finne produktet"]));

		product.VisibilityState = ProductVisibility.DELETED;
		product.Updated = DateTime.UtcNow;

		_context.SaveChanges();
		return Ok();
	}
}