using System.Collections.Generic;
using System.IO;
using Microsoft.Extensions.Configuration;
using VSH.Data.Static;

namespace VSH.Utilities;

public static class ConfigurationExtensions
{
	public static string GetVersion(this IConfiguration configuration) {
		var versionFilePath = Path.Combine(AppPaths.WwwRoot.HostPath, "version.txt");
		if (!File.Exists(versionFilePath))
			return "unknown-" + configuration.GetValue<string>("ASPNETCORE_ENVIRONMENT");
		var versionText = File.ReadAllText(versionFilePath);
		return versionText + "-" + configuration.GetValue<string>("ASPNETCORE_ENVIRONMENT");
	}

	public static IEnumerable<string> GetOrderStatusEmailRecipients(this IConfiguration configuration) {
		var orderEmailRecipientsFilePath =
				Path.Combine(AppPaths.AppData.HostPath, "settings", "order_email_addresses");
		if (!File.Exists(orderEmailRecipientsFilePath))
			return default;
		var fileContent = File.ReadAllText(orderEmailRecipientsFilePath);
		return fileContent.Split(";");
	}
}