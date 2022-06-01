using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using IOL.Helpers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using VSH.Data;
using VSH.Data.Static;

namespace VSH.Services;

public class AssetsService
{
	private readonly MainDbContext _context;
	private readonly ILogger<AssetsService> _logger;


	public AssetsService(MainDbContext context, ILogger<AssetsService> logger) {
		_context = context;
		_logger = logger;
	}

	public Task RemoveUnusedProductImages() {
		try {
			_logger.LogDebug("Starting RemoveUnusedProductImages");
			var inUseFileNames = new List<string>();

			foreach (var productImageList in _context.Products.Select(c => c.Images).AsNoTracking()) {
				var defaultFiles = productImageList.Select(image => image.FileName).ToList();
				var smallFiles = defaultFiles.Select(c => c.ExtractFileName() + "-300" + c.ExtractExtension());
				var miniFiles = defaultFiles.Select(c => c.ExtractFileName() + "-150" + c.ExtractExtension());
				inUseFileNames.AddRange(defaultFiles);
				inUseFileNames.AddRange(miniFiles);
				inUseFileNames.AddRange(smallFiles);
			}

			var removedFileCount = 0;
			if (inUseFileNames.Any()) {
				foreach (var diskFile in Directory.EnumerateFiles(AppPaths.ProductImages.HostPath)) {
					if (inUseFileNames.Any(c => c == diskFile))
						continue;
					if (File.Exists(diskFile))
						File.Delete(diskFile);
					removedFileCount++;
					_logger.LogDebug("Deleted " + diskFile);
				}
			}

			_logger.LogInformation("Removed " + removedFileCount + " unused product images");
			return Task.CompletedTask;
		} catch (Exception ex) {
			_logger.LogError("Exception removing unused assets: {exception}", ex.Message);
			return Task.CompletedTask;
		}
	}
}