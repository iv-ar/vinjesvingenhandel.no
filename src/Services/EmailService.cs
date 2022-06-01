using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace VSH.Services;

public class EmailService
{
	private readonly string _sendGridApiKey;
	private readonly string _fromAddress;
	private readonly string _fromName;
	private readonly string _replyToAddress;
	private readonly ILogger<EmailService> _logger;

	public EmailService(IConfiguration configuration, ILogger<EmailService> logger) {
		_sendGridApiKey = configuration.GetValue<string>("SENDGRID_API_KEY");
		_fromAddress = configuration.GetValue<string>("MAIL_FROM_ADDRESS");
		_replyToAddress = configuration.GetValue<string>("MAIL_REPLY_TO_ADDRESS");
		_fromName = configuration.GetValue<string>("MAIL_FROM_NAME");
		_logger = logger;
	}

	public async Task<bool> SendEmailAsync(
			string subject,
			string message,
			IEnumerable<string> recipients
	) {
		foreach (var recipient in recipients) {
			if (!await SendEmailAsync(subject, message, recipient)) {
				return false;
			}
		}

		return true;
	}

	public Task<bool> SendEmailAsync(
			string subject,
			string message,
			string recipient
	) {
		return Task.FromResult(false);
	}
}
