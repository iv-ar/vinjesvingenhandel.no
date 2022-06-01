using System;
using VSH.Data.Enums;

namespace VSH.Utilities;

public static class EnumName
{
	public static string ForDocumentType(DocumentType type) => type switch {
			DocumentType.SALES_TERMS => "Salsvilkår",
			DocumentType.CONTACT_PAGE => "Kontaktside",
			DocumentType.PRIVACY_POLICY => "Personvernerklæring",
			DocumentType.ABOUT_PAGE => "Om oss",
			DocumentType.DEALERS_PAGE => "Leverandørar",
			_ => throw new ArgumentException("Unknown DocumentType " + type)
	};

	public static string ForOrderStatus(OrderStatus type) => type switch {
			OrderStatus.FAILED => "Feila",
			OrderStatus.CANCELLED => "Kansellert",
			OrderStatus.COMPLETED => "Fullført",
			OrderStatus.IN_PROGRESS => "Pågåande",
			OrderStatus.AWAITING_VIPPS => "Ventar på vipps",
			OrderStatus.AWAITING_INVOICE => "Ventar på faktura",
			_ => throw new ArgumentException("Unknown OrderStatus " + type)
	};

	public static string ForPriceSuffix(PriceSuffix type) => type switch {
			PriceSuffix.PER => ",-",
			PriceSuffix.KILOS => ",- kg",
			_ => throw new ArgumentException("Unknown PriceSuffix " + type)
	};

	public static string ForPaymentType(OrderPaymentType type) => type switch {
			OrderPaymentType.VIPPS => "Vipps",
			OrderPaymentType.INVOICE_BY_EMAIL => "Faktura på mail",
			_ => throw new ArgumentException("Unknown OrderPaymentType " + type)
	};
}