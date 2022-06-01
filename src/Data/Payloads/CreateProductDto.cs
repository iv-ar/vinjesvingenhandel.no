using System;
using System.Collections.Generic;
using VSH.Data.Enums;

namespace VSH.Data.Payloads;

public class CreateProductDto
{
	public string Name { get; set; }
	public string Description { get; set; }
	public double Price { get; set; }
	public PriceSuffix PriceSuffix { get; set; }
	public Guid CategoryId { get; set; }
	public List<TProductImage> Images { get; set; }
	public int Count { get; set; }

	public class TProductImage
	{
		public string FileName { get; set; }
		public int Order { get; set; }
	}
}