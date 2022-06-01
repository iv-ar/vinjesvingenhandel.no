using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using IOL.VippsEcommerce;
using IOL.VippsEcommerce.Models.Api;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using VSH.Data;
using VSH.Data.Enums;

namespace VSH.BackgroundServices;

public class VippsOrderStatusCheckerBackgroundService : BackgroundService
{
	private readonly ILogger<VippsOrderStatusCheckerBackgroundService> _logger;

	public VippsOrderStatusCheckerBackgroundService(
			IServiceProvider services,
			ILogger<VippsOrderStatusCheckerBackgroundService> logger
	) {
		Services = services;
		_logger = logger;
	}

	public IServiceProvider Services { get; }

	protected override async Task ExecuteAsync(CancellationToken stoppingToken) {
		using var scope = Services.CreateScope();
		var context =
				scope.ServiceProvider
					 .GetRequiredService<MainDbContext>();
		var vipps =
				scope.ServiceProvider
					 .GetService<VippsEcommerceService>();

		if (vipps == default) {
			return;
		}

		foreach (var order in context.Orders.Where(c => c.Created < DateTime.UtcNow.AddDays(1)
														&& c.Status == OrderStatus.AWAITING_VIPPS)) {
			try {
				var vippsResponse = await vipps.GetPaymentDetailsAsync(order.OrderReference, stoppingToken);
				order.VippsTransactionId = vippsResponse.TransactionLogHistory.LastOrDefault()?.TransactionId;
			} catch (Exception e) {
				if (e is VippsRequestException vippsRequestException) {
					Console.WriteLine(vippsRequestException);
				}

				Console.WriteLine(e);
			}

			await context.SaveChangesAsync(stoppingToken);
			_logger.LogInformation("Got payment details from vipps for order with id: " + order.Id);
		}
	}
}