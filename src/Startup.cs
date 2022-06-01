using System;
using System.Globalization;
using System.IO;
using System.Text.Json;
using System.Text.Json.Serialization;
using IOL.VippsEcommerce;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using VSH.BackgroundServices;
using VSH.Data;
using VSH.Data.Miscellaneous;
using VSH.Data.Static;
using VSH.Services;

namespace VSH;

public class Startup
{
	private IConfiguration Configuration { get; }
	private IWebHostEnvironment Environment { get; }

	public Startup(IConfiguration configuration, IWebHostEnvironment environment) {
		Configuration = configuration;
		Environment = environment;
	}

	// https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
	private static readonly CultureInfo[] _supportedCultures = {
			new("nb"),
			new("en")
	};

	public static CultureInfo DefaultCulture { get; private set; } = new("nb");

	private static readonly Action<RequestLocalizationOptions> _appLocalizationOptions = options => {
		options.DefaultRequestCulture = new RequestCulture(DefaultCulture, DefaultCulture);
		options.ApplyCurrentCultureToResponseHeaders = false;
		options.SupportedCultures = _supportedCultures;
		options.SupportedUICultures = _supportedCultures;
		/*options.RequestCultureProviders.Insert(0, new CookieRequestCultureProvider {
				CookieName = Cookies.Culture.Name,
				Options = new RequestLocalizationOptions {
					DefaultRequestCulture = new RequestCulture(DefaultCulture, DefaultCulture)
				}
			}
		);*/
	};

	private static readonly Action<JsonOptions> _jsonSettings = options => {
		options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.Preserve;
		options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
		options.JsonSerializerOptions.NumberHandling = JsonNumberHandling.AllowReadingFromString;
		options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
	};

	private string GetConnectionStringFromEnvironment() {
		var host = Configuration.GetValue<string>("DB_HOST");
		var port = Configuration.GetValue<string>("DB_PORT");
		var user = Configuration.GetValue<string>("DB_USER");
		var password = Configuration.GetValue<string>("DB_PASSWORD");
		var database = Configuration.GetValue("DB_NAME", "vsh");
		return $"Server={host};Port={port};Database={database};User Id={user};Password={password}";
	}

	public void ConfigureServices(IServiceCollection services) {
		DefaultCulture = new CultureInfo(Configuration["General:DefaultCulture"]);
		services.AddDataProtection()
				.PersistKeysToFileSystem(new DirectoryInfo(AppPaths.DataProtectionKeys.HostPath));

		services.Configure(_jsonSettings);

		services.AddCors();

		services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
				.AddCookie(options => {
					options.LoginPath = new PathString("/logginn");
					options.Cookie.Name = AppCookies.Session.Name;
					options.Cookie.SameSite = SameSiteMode.Strict;
					options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
				});

		services.AddVippsEcommerceService(o => {
			o.ApiUrl = "https://example.org";
			o.PrimarySubscriptionKey = "1234";
			o.ClientSecret = "1234";
			o.ClientId = "1234";
		});

		services.AddAntiforgery(options => {
			options.HeaderName = "XSRF-TOKEN";
			options.FormFieldName = "xsrf";
			options.Cookie.Name = AppCookies.Xsrf.Name;
			options.Cookie.SameSite = SameSiteMode.Strict;
			options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
		});

		services.AddDbContext<MainDbContext>(options => {
			options.UseNpgsql(GetConnectionStringFromEnvironment(),
							  builder => {
								  builder.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
								  builder.EnableRetryOnFailure(5, TimeSpan.FromSeconds(10), default);
							  })
				   .UseSnakeCaseNamingConvention();
			if (Environment.IsDevelopment())
				options.EnableSensitiveDataLogging();
		});

		services.Configure(_appLocalizationOptions);
		services.AddLocalization(options => {
			options.ResourcesPath = "Resources";
		});

		services.AddScoped<OrderService>();
		services.AddScoped<AssetsService>();
		services.AddSingleton<EmailService>();
		services.AddHostedService<StartupTasksBackgroundService>();
		services.AddHostedService<VippsOrderStatusCheckerBackgroundService>();
		services.Configure<AppSettings.GeneralConfiguration>(Configuration.GetSection(AppSettings.GeneralConfiguration.Name));
		services.AddRazorPages(options => {
					options.Conventions.AuthorizeFolder("/kontoret");
				})
				.AddRazorRuntimeCompilation()
				.AddJsonOptions(_jsonSettings);

		services.Configure<RouteOptions>(options => {
			options.LowercaseUrls = true;
			options.LowercaseQueryStrings = true;
		});
		services.AddControllers().AddJsonOptions(_jsonSettings);
	}

	public static void Configure(IApplicationBuilder app, IWebHostEnvironment env) {
		if (env.IsDevelopment()) {
			app.UseDeveloperExceptionPage();
		} else {
			app.UseExceptionHandler("/errors/500");
		}

		CultureInfo.DefaultThreadCurrentCulture = DefaultCulture;
		CultureInfo.DefaultThreadCurrentUICulture = DefaultCulture;

		app.UseStatusCodePagesWithReExecute("/errors/{0}")
		   .UseStaticFiles()
		   .UseRouting()
		   .UseCors(builder => {
			   builder.WithOrigins("http://localhost:8080")
					  .AllowCredentials()
					  .AllowAnyHeader()
					  .AllowAnyMethod();
		   })
		   .UseRequestLocalization(_appLocalizationOptions)
		   .UseAuthentication()
		   .UseAuthorization()
		   .UseEndpoints(endpoints => {
			   endpoints.MapControllers();
			   endpoints.MapRazorPages();
		   });
	}
}
