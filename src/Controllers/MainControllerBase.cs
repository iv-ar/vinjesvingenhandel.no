using System;
using System.Linq;
using System.Security.Claims;
using IOL.Helpers;
using Microsoft.AspNetCore.Mvc;

namespace VSH.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MainControllerBase : ControllerBase
{
	public string CurrentHost => Request.GetRequestHost();


	protected LoggedInUserModel LoggedInUser => new() {
			Username = User.Identity?.Name,
			Id = User.Claims.SingleOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value.ToGuid() ?? default
	};

	protected class LoggedInUserModel
	{
		public Guid Id { get; set; }
		public string Username { get; set; }
	}
}