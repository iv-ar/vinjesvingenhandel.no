using System;
using System.Collections.Generic;

namespace VSH.Data.Payloads;

public record ValidateOrderPayload
{
	public List<ProductValidationDto> Products { get; set; }

	public class ProductValidationDto
	{
		public Guid Id { get; set; }
		public int Count { get; set; }
	}
}