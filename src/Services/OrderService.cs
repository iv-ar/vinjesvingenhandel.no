using System;
using System.Linq;
using System.Threading.Tasks;
using IOL.Helpers;
using IOL.VippsEcommerce;
using IOL.VippsEcommerce.Models.Api;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Localization;
using VSH.Data;
using VSH.Data.Database;
using VSH.Data.Results;
using VSH.Utilities;

namespace VSH.Services;

public class OrderService
{
	private readonly MainDbContext _context;
	private readonly IStringLocalizer<SharedServiceResources> _localizer;
	private readonly IVippsEcommerceService _vippsService;
	private readonly string _vippsMsn;

	public OrderService(
			MainDbContext context,
			IStringLocalizer<SharedServiceResources> localizer,
			IVippsEcommerceService vippsService,
			IConfiguration configuration
	) {
		_context = context;
		_localizer = localizer;
		_vippsService = vippsService;
		_vippsMsn = configuration.GetValue<string>("VIPPS_MSN");
	}

	public AppValidationResult ValidateOrderProducts(Order payload) {
		var validationResult = new AppValidationResult();
		foreach (var product in payload.Products) {
			var dbProduct = _context.Products.SingleOrDefault(p => p.Id == product.Id);
			if (dbProduct == default || !dbProduct.IsAvailable || !dbProduct.IsVisible) {
				var error = new AppValidationResult.ValidationError(product.Id);
				error.Errors.Add(string.Format(_localizer["Dette produktet er dessverre ikke tilgjengelig"]));
				validationResult.Errors.Add(error);
			} else if (dbProduct.Count != -1 && dbProduct.Count < product.NumberOfItems) {
				var error = new AppValidationResult.ValidationError(product.Id);
				error.Errors.Add(string.Format(_localizer
													   [
														"Vi har dessverre ikke så mange eksemplarer av dette produktet"]));
				validationResult.Errors.Add(error);
			}
		}

		return validationResult;
	}

	public AppValidationResult ValidateOrder(Order payload) {
		var validationResult = new AppValidationResult();
		if (payload.ContactInfo != default) {
			if (payload.ContactInfo.Name.IsNullOrWhiteSpace()) {
				var error = new AppValidationResult.ValidationError();
				error.Errors.Add(_localizer["Navn er påkrevd"]);
				validationResult.Errors.Add(error);
			}

			if (payload.ContactInfo.EmailAddress.IsNullOrWhiteSpace()) {
				var error = new AppValidationResult.ValidationError();
				error.Errors.Add(_localizer["E-postadresse er påkrevd"]);
				validationResult.Errors.Add(error);
			} else if (!payload.ContactInfo.EmailAddress.IsValidEmailAddress()) {
				var error = new AppValidationResult.ValidationError();
				error.Errors.Add(_localizer["E-postadressen er ugyldig"]);
				validationResult.Errors.Add(error);
			}

			if (payload.ContactInfo.PhoneNumber.IsNullOrWhiteSpace()) {
				var error = new AppValidationResult.ValidationError();
				error.Errors.Add(_localizer["Telefonnummer er påkrevd"]);
				validationResult.Errors.Add(error);
			} else if (!payload.ContactInfo.PhoneNumber.IsValidNorwegianPhoneNumber()) {
				var error = new AppValidationResult.ValidationError();
				error.Errors.Add(_localizer["Telefonnummeret er ugyldig"]);
				validationResult.Errors.Add(error);
			}
		} else {
			var error = new AppValidationResult.ValidationError();
			error.Errors.Add(_localizer["Kontaktinfo er påkrevd"]);
			validationResult.Errors.Add(error);
		}

		var productValidationResult = ValidateOrderProducts(payload);
		validationResult.Errors.AddRange(productValidationResult.Errors);

		return validationResult;
	}

	public async Task<Uri> GetVippsPaymentUrlAsync(Order order, string hostname) {
		var totalAmountInOre = order.Products.Sum(c => c.NumberOfItems * c.PriceAtTimeOfOrder) * 100;

		var initiatePaymentRequest = new VippsInitiatePaymentRequest {
				CustomerInfo = new TCustomerInfo {
						MobileNumber = order.ContactInfo.PhoneNumber
				},
				Transaction = new TTransactionInfoInitiate {
						Amount = Convert.ToInt32(totalAmountInOre),
						OrderId = order.OrderReference,
						TimeStamp = DateTime.UtcNow.ToString("o"),
						SkipLandingPage = false,
						TransactionText = "Bestilling på nett",
						UseExplicitCheckoutFlow = false
				},
				MerchantInfo = new TMerchantInfo {
						FallBack = hostname + "/api/orders/vipps/payment-callback/" + order.OrderReference,
						CallbackPrefix = hostname + "/api/orders/vipps/callbacks-for-payment-update",
						IsApp = false,
						MerchantSerialNumber = _vippsMsn
				}
		};

		try {
			var response = await _vippsService.InitiatePaymentAsync(initiatePaymentRequest);
			return response.Url.IsNullOrWhiteSpace() ? default : new Uri(response.Url);
		} catch (Exception e) {
			Console.WriteLine(e);
			throw;
		}
	}
}