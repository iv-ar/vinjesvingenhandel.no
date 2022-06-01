using System;
using System.Collections.Generic;
using VSH.Data.Database;
using VSH.Data.Enums;

namespace VSH.Data.Dtos;

public class AdminViewOrderDto
{
	public Guid Id { get; set; }
	public Order.ContactInformation ContactInformation { get; set; }
	public List<OrderDetailProduct> Products { get; set; }
	public string OrderReference { get; set; }
	public DateTime OrderDate { get; set; }
	public OrderPaymentType PaymentType { get; set; }
	public OrderStatus Status { get; set; }
	public string VippsStatus { get; set; }
	public string VippsId { get; set; }
	public string VippsTransactionStatus { get; set; }
	public string Comment { get; set; }

	public class OrderDetailProduct
	{
		public Guid Id { get; set; }
		public string Name { get; set; }
		public int Count { get; set; }
		public decimal PayedPrice { get; set; }
	}
}