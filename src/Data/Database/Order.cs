using System;
using System.Collections.Generic;
using System.Linq;
using IOL.Helpers;
using IOL.VippsEcommerce.Models.Api;
using VSH.Data.Enums;
using VSH.Utilities;

namespace VSH.Data.Database;

public class Order : Base
{
	public string Comment { get; set; }
	public string OrderReference { get; set; }
	public OrderStatus Status { get; set; }
	public OrderPaymentType PaymentType { get; set; }
	public string VippsTransactionId { get; set; }
	public ETransactionStatus VippsTransactionStatus { get; set; }
	public EStatusEnum VippsStatus { get; set; }
	public ContactInformation ContactInfo { get; set; }
	public List<OrderProduct> Products { get; set; }

	public class ContactInformation
	{
		public string Name { get; set; }
		public string PhoneNumber { get; set; }
		public string EmailAddress { get; set; }
	}

	public decimal Total(bool includeTax = true) {
		if (!Products.Any())
			return default;
		var total = Products.Sum(product => product.PriceAtTimeOfOrder * product.NumberOfItems);
		if (includeTax)
			return total;
		var taxCut = total * 25 / 100;
		return total - taxCut;
	}

	public decimal Tax(bool includeTax = true) {
		if (!Products.Any())
			return default;
		var total = Products.Sum(product => product.PriceAtTimeOfOrder * product.NumberOfItems);
		var taxCut = total * 25 / 100;
		return taxCut;
	}

	public string GetAdminMailContent(string hostname) => @$"
Referanse: {OrderReference}
Lenke: {hostname}/kontoret/bestillinger?order={OrderReference}
Betalingsmetode: {EnumName.ForPaymentType(PaymentType)}
Status: {EnumName.ForOrderStatus(Status)}
Navn: {ContactInfo.Name}
E-postadresse: {ContactInfo.EmailAddress}
Telefon: {ContactInfo.PhoneNumber}
{(Comment.HasValue() ? "Kommentar:" + Comment : "")}
";

	public string GetCustomerMailContent(string hostname) => @$"
Hei {ContactInfo.Name}, tusen takk for din bestilling!
Gå til {hostname}/status/{OrderReference} for å få full oversikt over bestillinga.

Hvis du har spørsmål angående din ordre er det bare å svare på denne mailen så svarer vi så raskt vi kan.

Med venleg hilsen

Øystein og Bodil
Vinjesvingen Handel AS
915 61 900
";
}

public class OrderProduct
{
	public Guid Id { get; set; }

	public int NumberOfItems { get; set; }

	public decimal PriceAtTimeOfOrder { get; set; }

	public decimal Total(bool includeTax = true) {
		if (NumberOfItems == default || PriceAtTimeOfOrder == default)
			return default;
		var total = PriceAtTimeOfOrder * NumberOfItems;
		if (includeTax)
			return total;
		var taxCut = total * 25 / 100;
		return total - taxCut;
	}

	public decimal Tax(bool includeTax = true) {
		if (NumberOfItems == default || PriceAtTimeOfOrder == default)
			return default;
		var total = PriceAtTimeOfOrder * NumberOfItems;
		var taxCut = total * 25 / 100;
		return taxCut;
	}
}