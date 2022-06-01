using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using VSH.Data;
using VSH.Data.Payloads;
using VSH.Data.Results;
using IOL.Helpers;
using VSH.Data.Database;

namespace VSH.Controllers;

public class AccountController : MainControllerBase
{
	private readonly IAuthenticationService _authentication;
	private readonly MainDbContext _context;
	private readonly IStringLocalizer<SharedControllerResources> _localizer;

	public AccountController(
			MainDbContext context,
			IStringLocalizer<SharedControllerResources> localizer,
			IAuthenticationService authentication
	) {
		_context = context;
		_localizer = localizer;
		_authentication = authentication;
	}

	[ValidateAntiForgeryToken]
	[HttpPost("login")]
	public ActionResult Login(LoginPayload payload) {
		if (!ModelState.IsValid)
			BadRequest(ModelState);
		var user = _context.Users.SingleOrDefault(u => u.Username == payload.Username);
		if (user == default || !user.VerifyPassword(payload.Password))
			return BadRequest(new ErrorResult(_localizer["Ugyldig brukernavn eller passord"]));

		var claims = new List<Claim> {
				new(ClaimTypes.NameIdentifier, user.Id.ToString()),
				new(ClaimTypes.Name, user.Username),
		};
		var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
		var principal = new ClaimsPrincipal(identity);
		var authenticationProperties = new AuthenticationProperties {
				AllowRefresh = true,
				IssuedUtc = DateTimeOffset.UtcNow,
		};

		if (payload.Persist) {
			authenticationProperties.ExpiresUtc = DateTimeOffset.UtcNow.AddMonths(6);
			authenticationProperties.IsPersistent = true;
		}

		HttpContext.SignInAsync(principal, authenticationProperties);
		return Ok();
	}

	[Authorize]
	[HttpPost("update-password")]
	public ActionResult UpdatePassword(UpdatePasswordPayload payload) {
		if (payload.NewPassword.IsNullOrWhiteSpace()) {
			return BadRequest(new ErrorResult(_localizer["Ugyldig skjema"],
											  _localizer["Nytt passord er påkrevd"]));
		}

		if (payload.NewPassword.Length < 6) {
			return BadRequest(new ErrorResult(_localizer["Ugyldig skjema"],
											  _localizer["Nytt passord må minst inneholde 6 karakterer"]));
		}

		var user = _context.Users.SingleOrDefault(c => c.Id == LoggedInUser.Id);
		if (user == default) {
			HttpContext.SignOutAsync();
			return Redirect("/");
		}


		user.HashAndSetPassword(payload.NewPassword);
		user.Updated = DateTime.UtcNow;
		_context.SaveChanges();
		return Ok();
	}

	[AllowAnonymous]
	[HttpGet("create-initial")]
	public ActionResult CreateInitialUser() {
		if (_context.Users.Any()) return Redirect("/kontoret");
		var user = new User("admin@ivarlovlie.no");
		user.SetBaseValues();
		user.HashAndSetPassword("ivar123");
		_context.Users.Add(user);
		_context.SaveChanges();
		return Redirect("/kontoret");
	}

	[AllowAnonymous]
	[HttpGet("me")]
	public async Task<ActionResult> GetLoggedInUser() {
		var authres =
				await _authentication.AuthenticateAsync(HttpContext, CookieAuthenticationDefaults.AuthenticationScheme);
		if (authres.Succeeded)
			return Ok(LoggedInUser);

		await HttpContext.SignOutAsync();
		return StatusCode(403);
	}

	[HttpGet("logout")]
	public ActionResult Logout() {
		HttpContext.SignOutAsync();
		return Ok();
	}
}