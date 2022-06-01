using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using VSH.Data.Static;

namespace VSH.BackgroundServices;

public class StartupTasksBackgroundService : BackgroundService
{
	private readonly ILogger<StartupTasksBackgroundService> _logger;

	private static IEnumerable<string> PathsToEnsureCreated => new List<string> {
			AppPaths.ProductImages.HostPath,
			AppPaths.DocumentImages.HostPath,
	};

	public StartupTasksBackgroundService(ILogger<StartupTasksBackgroundService> logger) {
		_logger = logger;
	}

	protected override Task ExecuteAsync(CancellationToken stoppingToken) {
		EnsureCreated();
		return Task.CompletedTask;
	}

	private void EnsureCreated() {
		foreach (var path in PathsToEnsureCreated) {
			Directory.CreateDirectory(path);
			_logger.LogInformation("EnsuredCreated: " + path);
		}
	}
}