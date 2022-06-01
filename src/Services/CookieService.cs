using System.Collections.Generic;
using System.Globalization;
using VSH.Data.Enums;
using VSH.Data.Miscellaneous;
using VSH.Data.Static;

namespace VSH.Services;

public class CookieService
{
	private static Dictionary<string, string> XsrfCookieDescriptions => new() {
			{
					"en",
					"This cookie is only required for submitting forms like the order submit form. The cookie is used to prevent abuse, nothing personal is saved or shared with this cookie."
			}, {
					"nb",
					"Denne informasjonskapselen er bare påkrevd for å sende skjema som for eksempel bestillingsskjema. Informasjonskapselen blir brukt for å forhindre misbruk, ingen persondata blir lagret eller delt med denne informasjonskapselen."
			},
	};

	private static Dictionary<string, string> SessionCookieDescriptions => new() {
			{
					"en",
					"This cookie is only required for keeping you logged in while using this site. The cookie is purely functional and nothing personal is saved or shared with this cookie."
			}, {
					"nb",
					"Denne informasjonskapselen er bare påkrevd for å holde deg logget på imens du bruker denne siden. Informasjonskapselen er bare funksjonell og ingen persondata blir lagret eller delt med denne informasjonskapselen."
			},
	};

	private static Dictionary<string, string> CultureCookieDescriptions => new() {
			{
					"en", "This cookie is used to keep track of your preffered language, nothing personal is saved or shared with this cookie."
			}, {
					"nb",
					"Denne informasjonskapselen bruker vi for å lagre hvilket språk du vil se siden på, ingen persondata blir lagret eller delt med denne informasjonskapselen."
			},
	};

	public static AppCookie GetCookie(CookieType type) {
		var isoCode = CultureInfo.DefaultThreadCurrentCulture?.TwoLetterISOLanguageName ?? Startup.DefaultCulture.TwoLetterISOLanguageName;
		return type switch {
				CookieType.XSRF => AppCookies.Xsrf with {
						Description = XsrfCookieDescriptions[isoCode]
				},
				CookieType.SESSION => AppCookies.Session with {
						Description = SessionCookieDescriptions[isoCode]
				},
				CookieType.CULTURE => AppCookies.Culture with {
						Description = CultureCookieDescriptions[isoCode]
				},
				_ => default
		};
	}
}