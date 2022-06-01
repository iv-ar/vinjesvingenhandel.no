using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using VSH.Data;
using VSH.Data.Database;
using VSH.Data.Enums;
using VSH.Data.Results;
using IOL.Helpers;

namespace VSH.Controllers;

public class CategoriesController : MainControllerBase
{
	private readonly MainDbContext _context;
	private readonly IStringLocalizer<SharedControllerResources> _localizer;

	public CategoriesController(MainDbContext context, IStringLocalizer<SharedControllerResources> localizer) {
		_context = context;
		_localizer = localizer;
	}

	[HttpGet]
	public ActionResult GetCategories() {
		return Ok(_context.Categories.OrderBy(c => c.Created));
	}

	[HttpGet("with-products")]
	public ActionResult GetCategoriesWithProducts() {
		return Ok(_context.Categories.Include(c => c.Products)
						  .OrderBy(c => c.Created));
	}

	[HttpGet("{id}")]
	public ActionResult GetCategory(Guid id) {
		return Ok(_context.Categories.SingleOrDefault(c => c.Id == id));
	}

	[HttpGet("{id}/enable")]
	public ActionResult EnableCategory(Guid id) {
		var category = _context.Categories.SingleOrDefault(c => c.Id == id);
		if (category == default)
			return NotFound(new ErrorResult(_localizer["Kunne ikke finne kategorien"]));
		category.VisibilityState = CategoryVisibility.DEFAULT;
		category.Update();
		_context.SaveChanges();
		return Ok();
	}

	[HttpGet("{id}/disable")]
	public ActionResult DisableCategory(Guid id) {
		var category = _context.Categories.SingleOrDefault(c => c.Id == id);
		if (category == default)
			return NotFound(new ErrorResult(_localizer["Kunne ikke finne kategorien"]));
		category.VisibilityState = CategoryVisibility.DISABLED;
		category.Update();
		_context.SaveChanges();
		return Ok();
	}

	[HttpGet("create")]
	public ActionResult CreateCategoryAsync(string name) {
		if (name.IsNullOrWhiteSpace())
			return BadRequest(new ErrorResult(_localizer["Ugyldig skjema"], _localizer["Navn er påkrevd"]));

		if (_context.Categories.Any(c => c.Name == name))
			return BadRequest(new ErrorResult(_localizer["Ugyldig skjema"],
											  _localizer["En kategori med det navnet finnes allerede"]));

		var newCategory = new Category(name);
		newCategory.SetBaseValues();
		_context.Categories.Add(newCategory);
		_context.SaveChanges();
		return Ok(newCategory);
	}

	[HttpGet("{id}/update")]
	public ActionResult UpdateCategoryAsync(Guid id, string newName) {
		var category = _context.Categories.SingleOrDefault(c => c.Id == id);
		if (category == default)
			return NotFound(new ErrorResult(_localizer["Kunne ikke finne kategorien"]));
		if (newName.IsNullOrWhiteSpace())
			return BadRequest(new ErrorResult(_localizer["Ugyldig skjema"],
											  _localizer["Det nye navnet kan ikke være tomt"]));
		category.Update(new Category(newName));
		_context.SaveChanges();
		return Ok();
	}

	[HttpDelete("{id}/delete")]
	public ActionResult DeleteCategoryAsync(Guid id) {
		var category = _context.Categories.Include(c => c.Products).SingleOrDefault(c => c.Id == id);
		if (category == default)
			return NotFound(new ErrorResult(_localizer["Kunne ikke finne kategorien"]));
		if (category.Products.Any()) {
			category.VisibilityState = CategoryVisibility.DELETED;
			_context.SaveChanges();
		} else {
			_context.Categories.Remove(category);
			_context.SaveChanges();
		}

		return Ok();
	}
}