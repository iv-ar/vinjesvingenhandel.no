using System.IO;
using VSH.Data.Miscellaneous;

namespace VSH.Data.Static;

public static class AppPaths
{
	public static AppPath WwwRoot => new() {
			HostPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"),
			WebPath = "/"
	};

	public static AppPath Assets => new() {
			HostPath = Path.Combine(WwwRoot.HostPath, "assets"),
			WebPath = "/assets"
	};

	public static AppPath ProductImages => new() {
			HostPath = Path.Combine(Assets.HostPath, "images", "products"),
			WebPath = Path.Combine(Assets.WebPath, "images", "products")
	};

	public static AppPath DocumentImages => new() {
			HostPath = Path.Combine(Assets.HostPath, "images", "documents"),
			WebPath = Path.Combine(Assets.WebPath, "images", "documents")
	};

	public static AppPath DataProtectionKeys => new() {
			HostPath = Path.Combine(AppData.HostPath, "DPKeys"),
	};

	public static AppPath AppData => new() {
			HostPath = Path.Combine(Directory.GetCurrentDirectory(), "AppData"),
	};

	public static AppPath DefaultProductImage => new() {
			HostPath = Path.Combine(Assets.HostPath, "profile", "innrammet.svg"),
			WebPath = Path.Combine(Assets.WebPath, "profile", "innrammet.svg")
	};
}