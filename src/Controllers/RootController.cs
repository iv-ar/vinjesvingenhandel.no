using System;
using System.Text;
using IOL.VippsEcommerce;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using VSH.Data.Static;

namespace VSH.Controllers;

public class RootController : MainControllerBase
{
	private readonly IVippsEcommerceService _vippsEcommerceService;
	private readonly IConfiguration _configuration;

	public RootController(IConfiguration configuration, IVippsEcommerceService vippsEcommerceService) {
		_configuration = configuration;
		_vippsEcommerceService = vippsEcommerceService;
	}

	[HttpGet("~/kontoret")]
	public ActionResult AdminRedirect() {
		return Redirect("/kontoret/produkter");
	}

	[Authorize]
	[HttpGet("~/info")]
	public ActionResult GetInfo() {
		var infoString = new StringBuilder();
		infoString.AppendLine("Variables");
		infoString.AppendLine($" - CurrentHost: {CurrentHost}");
		infoString.AppendLine("Environment");
		infoString.AppendLine($" - DB_HOST: {_configuration.GetValue("DB_HOST", "unset")}");
		infoString.AppendLine($" - DB_PORT: {_configuration.GetValue("DB_PORT", "unset")}");
		infoString.AppendLine($" - DB_USER: {_configuration.GetValue("DB_USER", "unset")}");
		infoString.AppendLine($" - DB_PASSWORD: {HiddenIfSet(_configuration.GetValue("DB_PASSWORD", "unset"))}");
		infoString.AppendLine($" - DB_NAME: {_configuration.GetValue("DB_NAME", "unset")}");
		infoString.AppendLine($" - SENDGRID_API_KEY: {HiddenIfSet(_configuration.GetValue("SENDGRID_API_KEY", "unset"))}");
		infoString.AppendLine($" - MAIL_FROM_ADDRESS: {_configuration.GetValue("MAIL_FROM_ADDRESS", "unset")}");
		infoString.AppendLine($" - MAIL_REPLY_TO_ADDRESS: {_configuration.GetValue("MAIL_REPLY_TO_ADDRESS", "unset")}");
		infoString.AppendLine($" - MAIL_FROM_NAME: {_configuration.GetValue("MAIL_FROM_NAME", "unset")}");
		infoString.AppendLine("Headers");
		infoString.AppendLine($" - X-Forwarded-For: {Request.Headers["X-Forwarded-For"]}");
		infoString.AppendLine($" - X-Real-IP: {Request.Headers["X-Real-IP"]}");
		infoString.AppendLine($" - X-Forwarded-Host: {Request.Headers["X-Forwarded-Host"]}");
		infoString.AppendLine($" - X-Forwarded-Proto: {Request.Headers["X-Forwarded-Proto"]}");
		return Ok(infoString.ToString());
	}

	[Authorize]
	[HttpGet("~/vipps-config")]
	public ActionResult GetVippsConfiguration() {
		return Ok(_vippsEcommerceService.Configuration);
	}

	private string HiddenIfSet(string value) {
		return value == "unset" ? "unset" : "*****";
	}

	[HttpPost("~/set-culture")]
	public ActionResult SetCulture(
			[FromForm] string culture,
			[FromQuery] string returnUrl
	) {
		Response.Cookies.Append(AppCookies.Culture.Name,
								CookieRequestCultureProvider.MakeCookieValue(new RequestCulture(culture)),
								new CookieOptions {
										Expires = DateTimeOffset.UtcNow.AddYears(1)
								});

		return LocalRedirect(returnUrl);
	}
}