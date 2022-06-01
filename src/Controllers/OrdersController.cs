using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using IOL.Helpers;
using IOL.VippsEcommerce;
using IOL.VippsEcommerce.Models.Api;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using VSH.Data;
using VSH.Data.Database;
using VSH.Data.Dtos;
using VSH.Data.Enums;
using VSH.Data.Results;
using VSH.Services;
using VSH.Utilities;

namespace VSH.Controllers;

public class OrdersController : MainControllerBase
{
	private readonly MainDbContext _context;
	private readonly OrderService _orderService;
	private readonly IVippsEcommerceService _vippsService;
	private readonly EmailService _emailService;
	private readonly ILogger<OrdersController> _logger;
	private readonly IConfiguration _configuration;

	public OrdersController(
			MainDbContext context,
			IConfiguration configuration,
			OrderService orderService,
			IVippsEcommerceService vippsService,
			EmailService emailService,
			ILogger<OrdersController> logger
	) {
		_context = context;
		_configuration = configuration;
		_orderService = orderService;
		_vippsService = vippsService;
		_logger = logger;
		_emailService = emailService;
	}

	[HttpGet]
	public ActionResult GetOrders(string filter = default) {
		return filter switch {
				"not-cancelled" => Ok(_context.Orders.Where(c => c.Status != OrderStatus.CANCELLED)
											  .OrderByDescending(c => c.Created)),
				_ => Ok(_context.Orders.OrderByDescending(c => c.Created))
		};
	}

	[HttpPost("submit")]
	public async Task<ActionResult> SubmitOrder(Order payload) {
		var validationResult = _orderService.ValidateOrder(payload);
		if (!validationResult.IsValid)
			return BadRequest(validationResult);
		payload.SetBaseValues();
		var orderRef = RandomString.Generate(6);
		var isOrderRefUsed = _context.Orders.Any(c => c.OrderReference == orderRef);

		while (isOrderRefUsed) {
			orderRef = RandomString.Generate(6);
			isOrderRefUsed = _context.Orders.Any(c => c.OrderReference == orderRef);
		}

		payload.OrderReference = orderRef;

		foreach (var payloadProduct in payload.Products) {
			var dbProduct = _context.Products.SingleOrDefault(c => c.Id == payloadProduct.Id);
			if (dbProduct == default) {
				throw new ApplicationException("Could not find product in order payload that passed validation");
			}

			payloadProduct.PriceAtTimeOfOrder = dbProduct.Price;
		}

		switch (payload.PaymentType) {
			case OrderPaymentType.VIPPS: {
				payload.Id = Guid.NewGuid();
				payload.Status = OrderStatus.AWAITING_VIPPS;
				await _context.Orders.AddAsync(payload);
				await _context.SaveChangesAsync();
				var vippsUrl = await _orderService.GetVippsPaymentUrlAsync(payload, CurrentHost);
				return Ok(vippsUrl);
			}
			case OrderPaymentType.INVOICE_BY_EMAIL: {
				payload.Status = OrderStatus.AWAITING_INVOICE;
				await _context.Orders.AddAsync(payload);
				await _context.SaveChangesAsync();

				await _emailService.SendEmailAsync("Ny ordre - VSH",
												   payload.GetAdminMailContent(CurrentHost),
												   _configuration.GetOrderStatusEmailRecipients());
				await _emailService.SendEmailAsync("Din ordre hos Vinjesvingen Handel AS",
												   payload.GetCustomerMailContent(CurrentHost),
												   payload.ContactInfo.EmailAddress);
				return Ok("/status/" + payload.OrderReference + "?clearCart=true");
			}
			default: {
				return BadRequest("No PaymentType was specified");
			}
		}
	}

	[HttpGet("{orderId}/details")]
	public ActionResult<AdminViewOrderDto> GetOrderDetails(Guid orderId) {
		var order = _context.Orders.SingleOrDefault(c => c.Id == orderId);
		if (order == default) {
			return NotFound();
		}

		var products = new List<AdminViewOrderDto.OrderDetailProduct>();

		foreach (var orderProduct in order.Products) {
			var dbProduct = _context.Products.SingleOrDefault(c => c.Id == orderProduct.Id);
			if (dbProduct == default)
				continue;
			products.Add(new AdminViewOrderDto.OrderDetailProduct {
					Id = orderProduct.Id,
					Count = orderProduct.NumberOfItems,
					PayedPrice = orderProduct.PriceAtTimeOfOrder,
					Name = dbProduct.Name
			});
		}

		var x = new AdminViewOrderDto {
				Comment = order.Comment,
				Id = order.Id,
				Products = products,
				Status = order.Status,
				ContactInformation = order.ContactInfo,
				OrderDate = order.Created,
				OrderReference = order.OrderReference,
				PaymentType = order.PaymentType,
				VippsId = order.VippsTransactionId,
				VippsStatus = order.VippsStatus.ToString(),
				VippsTransactionStatus = order.VippsTransactionStatus.ToString()
		};

		return x;
	}


	[HttpGet("{orderId}/capture")]
	public async Task<ActionResult> CaptureVippsPayment(Guid orderId) {
		var order = _context.Orders.SingleOrDefault(c => c.Id == orderId);
		if (order == default)
			return NotFound();
		try {
			var response = await _vippsService.CapturePaymentAsync(order.OrderReference,
																   new VippsPaymentActionRequest {
																		   Transaction = new TTransaction {
																				   TransactionText =
																						   order.OrderReference
																						   + "_"
																						   + DateTime.UtcNow.ToString("O")
																		   }
																   });
			if (response == default)
				return StatusCode(500);
			order.VippsStatus = response.TransactionInfo.Status;
			await _context.SaveChangesAsync();
			return Ok();
		} catch (Exception e) {
			Console.WriteLine(e);
			e.Data.Add("orderId", orderId);
			return StatusCode(500);
		}
	}

	[HttpGet("{orderId}/cancel")]
	public async Task<ActionResult> CancelVippsPayment(Guid orderId) {
		var order = _context.Orders.SingleOrDefault(c => c.Id == orderId);
		if (order == default)
			return NotFound();
		try {
			var response = await _vippsService.CancelPaymentAsync(order.OrderReference,
																  new VippsPaymentActionRequest {
																		  Transaction = new TTransaction {
																				  TransactionText =
																						  order.OrderReference
																						  + "_"
																						  + DateTime.UtcNow.ToString("O")
																		  }
																  });
			if (response == default)
				return StatusCode(500);
			order.VippsStatus = response.TransactionInfo.Status;
			await _context.SaveChangesAsync();
			return Ok();
		} catch (Exception e) {
			Console.WriteLine(e);
			e.Data.Add("orderId", orderId);
			return StatusCode(500);
		}
	}

	[HttpGet("{orderId}/refund")]
	public async Task<ActionResult> RefundVippsPayment(Guid orderId) {
		var order = _context.Orders.SingleOrDefault(c => c.Id == orderId);
		if (order == default)
			return NotFound();
		try {
			var response = await _vippsService.RefundPaymentAsync(order.OrderReference,
																  new VippsPaymentActionRequest {
																		  Transaction = new TTransaction {
																				  TransactionText =
																						  order.OrderReference
																						  + "_"
																						  + DateTime.UtcNow.ToString("O")
																		  }
																  });
			if (response == default)
				return StatusCode(500);
			order.VippsStatus = response.TransactionInfo.Status;
			await _context.SaveChangesAsync();
			return Ok();
		} catch (Exception e) {
			Console.WriteLine(e);
			e.Data.Add("orderId", orderId);
			return StatusCode(500);
		}
	}

	[HttpPost("validate-products")]
	public ActionResult<AppValidationResult> ValidateOrderProducts(Order payload) {
		return _orderService.ValidateOrderProducts(payload);
	}

	[HttpPost("validate")]
	public ActionResult<AppValidationResult> ValidateOrder(Order payload) {
		return _orderService.ValidateOrder(payload);
	}

	/// <summary>
	/// This is used for all payment updates performed at vipps and can be called anytime from vipps
	/// This endpoint updates the order status and save the body as an VippsResponses.InitiationResponse in db
	/// </summary>
	/// <param name="orderReference"></param>
	/// <returns></returns>
	[HttpPost("vipps/callbacks-for-payment-update/v2/payments/{orderReference}")]
	public async Task<ActionResult> VippsPaymentUpdateCallback([FromRoute] string orderReference) {
		var bodyContent = await new StreamReader(Request.Body).ReadToEndAsync();
		_logger.LogInformation("Recieved vipps payment update callback for order: " + orderReference);
		_logger.LogDebug("With body: " + bodyContent);

		var order = _context.Orders.SingleOrDefault(c => c.OrderReference == orderReference);
		if (order == default) {
			_logger.LogWarning("Could not find order: " + orderReference + ", in database");
			return Ok();
		}

		try {
			var response = JsonSerializer.Deserialize<VippsPaymentInitiationCallbackResponse>(bodyContent);
			if (response == default) {
				_logger.LogCritical("Could not deserialize vipps response into "
									+ nameof(VippsPaymentInitiationCallbackResponse));
				return Ok();
			}

			order.VippsTransactionId = response.TransactionInfo.TransactionId;
			order.VippsTransactionStatus = response.TransactionInfo.StatusEnum();
			order.Status = order.VippsTransactionStatus switch {
					ETransactionStatus.SALE or ETransactionStatus.RESERVED => OrderStatus.COMPLETED,
					ETransactionStatus.REJECTED or
							ETransactionStatus.CANCELLED or
							ETransactionStatus.AUTO_CANCEL => OrderStatus.CANCELLED,
					ETransactionStatus.SALE_FAILED or ETransactionStatus.RESERVE_FAILED => OrderStatus.FAILED,
					_ => OrderStatus.FAILED
			};
			await _context.SaveChangesAsync();

			if (order.Status != OrderStatus.COMPLETED) {
				_logger.LogWarning("OrderStatus is unsatisfactory for this stage of payment history, returning to cart page with error message");
				if (response.TransactionInfo != default) {
					_logger.LogWarning("Vipps TransactionStatus is " + response.TransactionInfo?.Status);
				} else {
					_logger.LogWarning("Vipps TransactionInfo is empty");
				}
			}

			return Ok();
		} catch (Exception e) {
			Console.WriteLine(e);
			e.Data.Add("orderid", order.Id);
			_logger.LogCritical(e, "WHOOOOOOOOOOOPS");
			return Ok();
		}
	}

	/// <summary>
	/// This endpoint is specified in the intiation request to vipps, regardless of the result of a capture in vipps, vipps will send customers to this endpoint.
	/// This endpoint decides where a customer is sent based on the result of a vipps payment request
	/// </summary>
	/// <param name="orderReference"></param>
	/// <returns></returns>
	[HttpGet("vipps/payment-callback/{orderReference}")]
	public async Task<ActionResult> VippsPaymentCallback([FromRoute] string orderReference) {
		_logger.LogInformation("Recieved vipps payment callback for order: " + orderReference);

		var order = _context.Orders.SingleOrDefault(c => c.OrderReference == orderReference);
		if (order == default) {
			_logger.LogWarning("Could not find order: " + orderReference + ", in database");
			return Redirect("/handlekorg?error=failed");
		}

		try {
			if (order.Status == OrderStatus.CANCELLED) {
				return Redirect("/handlekorg?error=cancelled");
			}

			if (order.Status != OrderStatus.COMPLETED) {
				_logger.LogWarning("OrderStatus is unsatisfactory for this stage of payment history, returning to cart page with error message");

				return Redirect("/handlekorg?error=failed");
			}

			await _emailService.SendEmailAsync("Ny ordre - VSH",
											   order.GetAdminMailContent(CurrentHost),
											   _configuration.GetOrderStatusEmailRecipients());

			await _emailService.SendEmailAsync("Din ordre hos Vinjesvingen Handel AS",
											   order.GetCustomerMailContent(CurrentHost),
											   order.ContactInfo.EmailAddress);

			return Redirect("/status/" + orderReference + "?clearCart=true");
		} catch (Exception e) {
			Console.WriteLine(e);
			e.Data.Add("orderid", order.Id);
			_logger.LogCritical(e, "WHOOOOOOOOOOOPS");
			return Redirect("/handlekorg?error=failed");
		}
	}
}
