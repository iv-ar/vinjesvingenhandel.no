using System;
using System.Reflection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Serilog;

namespace VSH;

public static class Program
{
	public static int Main(string[] args) {
		var config = new ConfigurationBuilder()
					 .AddUserSecrets(Assembly.GetExecutingAssembly(), true)
					 .AddEnvironmentVariables()
					 .Build();

		Log.Logger = new LoggerConfiguration()
					 .Enrich.FromLogContext()
					 .WriteTo.Console()
#if !DEBUG
						 .WriteTo.Seq(config.GetValue<string>("SEQ_API_URL"), apiKey: config.GetValue<string>("SEQ_API_KEY"))
#endif
					 .CreateLogger();

		try {
			Log.Information("Starting web host");
			CreateHostBuilder(args).Build().Run();
			return 0;
		} catch (Exception ex) {
			Log.Fatal(ex, "Host terminated unexpectedly");
			return 1;
		} finally {
			Log.CloseAndFlush();
		}
	}

	private static IHostBuilder CreateHostBuilder(string[] args) => Host.CreateDefaultBuilder(args)
																		.UseSerilog()
																		.ConfigureWebHostDefaults(webBuilder => {
																			webBuilder.UseKestrel(o => o.AddServerHeader = false);
																			webBuilder.UseStartup<Startup>();
																		});
}
