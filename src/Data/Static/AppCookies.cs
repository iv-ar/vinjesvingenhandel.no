using VSH.Data.Miscellaneous;

namespace VSH.Data.Static;

public static class AppCookies
{
	public static AppCookie Xsrf => new() {
			Name = "vsh_xsrf",
			Required = true
	};

	public static AppCookie Session => new() {
			Name = "vsh_session",
			Required = true
	};

	public static AppCookie Culture => new() {
			Name = "vsh_culture",
			Required = false
	};
}