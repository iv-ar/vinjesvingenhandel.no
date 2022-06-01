using System;
using System.Collections.Generic;
using IOL.Helpers;
using VSH.Data.Enums;
using VSH.Utilities;

namespace VSH.Data.Database;

public class Category : Base
{
	public Category(string name = default) {
		if (name.IsNullOrWhiteSpace())
			return;
		Name = name;
		Slug = name.Slugified();
	}

	public string Name { get; set; }
	public string Slug { get; set; }
	public CategoryVisibility VisibilityState { get; set; }
	public ICollection<Product> Products { get; set; }
	public bool Disabled => VisibilityState == CategoryVisibility.DISABLED;
	public bool Deleted => VisibilityState == CategoryVisibility.DELETED;

	public void Update(Category update = default) {
		Name = update?.Name ?? Name;
		VisibilityState = update?.VisibilityState ?? VisibilityState;
		Updated = DateTime.UtcNow;
	}
}