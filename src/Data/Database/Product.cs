using System.Collections.Generic;
using System.IO;
using System.Linq;
using VSH.Data.Enums;
using VSH.Data.Miscellaneous;
using VSH.Data.Static;
using VSH.Utilities;

namespace VSH.Data.Database;

public class Product : Base
{
	public string Name { get; set; }
	public string Description { get; set; }
	public decimal Price { get; set; }
	public PriceSuffix PriceSuffix { get; set; }
	public ProductVisibility VisibilityState { get; set; }
	public Category Category { get; set; }
	public List<ProductImage> Images { get; set; }
	public int Count { get; set; }
	public string Slug { get; set; }
	public bool ShowOnFrontpage { get; set; }

	public string ReadablePriceSuffix => EnumName.ForPriceSuffix(PriceSuffix);

	public AppPath GetPrimaryImage() {
		var productImage = Images.OrderBy(c => c.Order).FirstOrDefault();
		return productImage != default ? productImage.GetPath() : AppPaths.DefaultProductImage;
	}

	public string WebPath() => $"/produktar/{Category?.Slug}/{Slug}";

	public bool IsVisible => VisibilityState == ProductVisibility.DEFAULT;
	public bool IsAvailable => Count == -1 || Count >= 1;
}

public class ProductImage
{
	public ProductImage(string fileName = default, int order = default) {
		FileName = fileName;
		Order = order;
	}

	public int Order { get; }
	public string FileName { get; }

	public AppPath GetPath() {
		if (FileName == default) return AppPaths.DefaultProductImage;
		return new AppPath {
				WebPath = Path.Combine(AppPaths.ProductImages.WebPath, FileName),
				HostPath = Path.Combine(AppPaths.ProductImages.HostPath, FileName),
		};
	}
}