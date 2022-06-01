using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using VSH.Services;

namespace VSH.BackgroundServices;

/// <summary>
/// This service is not really necessary, but it is nice to have for future reference.
/// The job that this service is doing, could maybe become an http endpoint?
/// </summary>
public class AssetsCleanupBackgroundService : BackgroundService
{
	private readonly IServiceProvider _serviceProvider;
	private readonly ILogger<AssetsCleanupBackgroundService> _logger;

	private static TimeSpan CleanupInterval => TimeSpan.FromSeconds(10);

	public AssetsCleanupBackgroundService(
			IServiceProvider serviceProvider,
			ILogger<AssetsCleanupBackgroundService> logger
	) {
		_serviceProvider = serviceProvider ?? throw new ArgumentNullException(nameof(serviceProvider));
		_logger = logger;
	}

	protected override async Task ExecuteAsync(CancellationToken stoppingToken) {
		await StartInternalAsync(stoppingToken);
	}

	private async Task StartInternalAsync(CancellationToken cancellationToken) {
		while (true) {
			if (cancellationToken.IsCancellationRequested) {
				_logger.LogDebug("CancellationRequested... Exiting");
				break;
			}

			try {
				await Task.Delay(CleanupInterval, cancellationToken);
			} catch (TaskCanceledException) {
				_logger.LogDebug("TaskCanceledException... Exiting");
				break;
			} catch (Exception ex) {
				_logger.LogError($"Task.Delay exception: {ex.Message}. Exiting.");
				break;
			}

			if (cancellationToken.IsCancellationRequested) {
				_logger.LogDebug("CancellationRequested... Exiting");
				break;
			}

			using var serviceProvider = _serviceProvider.CreateScope();
			var assetsService = serviceProvider.ServiceProvider.GetRequiredService<AssetsService>();
			await assetsService.RemoveUnusedProductImages();
		}
	}
}
