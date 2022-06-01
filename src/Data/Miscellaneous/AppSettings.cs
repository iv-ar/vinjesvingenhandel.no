using System.Text.Json.Serialization;

namespace VSH.Data.Miscellaneous;

public class AppSettings
{
	[JsonPropertyName("General")]
	public GeneralConfiguration General { get; set; }

	[JsonPropertyName("Serilog")]
	public SerilogConfiguration Serilog { get; set; }

	public class GeneralConfiguration
	{
		public const string Name = "General";

		[JsonPropertyName("StoreName")]
		public string StoreName { get; set; }

		[JsonPropertyName("LegalName")]
		public string LegalName { get; set; }

		[JsonPropertyName("ShortStoreName")]
		public string ShortStoreName { get; set; }

		[JsonPropertyName("DefaultCulture")]
		public string DefaultCulture { get; set; }

		[JsonPropertyName("GoogleMapsUrl")]
		public string GoogleMapsUrl { get; set; }

		[JsonPropertyName("DefaultDescription")]
		public string DefaultDescription { get; set; }
	}

	public class SerilogConfiguration
	{
		public const string Name = "Serilog";

		[JsonPropertyName("Using")]
		public string[] Using { get; set; }

		[JsonPropertyName("MinimumLevel")]
		public MinimumLevel MinimumLevel { get; set; }

		[JsonPropertyName("WriteTo")]
		public WriteTo[] WriteTo { get; set; }

		[JsonPropertyName("Enrich")]
		public string[] Enrich { get; set; }

		[JsonPropertyName("Destructure")]
		public Destructure[] Destructure { get; set; }

		[JsonPropertyName("Properties")]
		public Properties Properties { get; set; }
	}

	public class Destructure
	{
		[JsonPropertyName("Name")]
		public string Name { get; set; }

		[JsonPropertyName("Args")]
		public Args Args { get; set; }
	}

	public class Args
	{
		[JsonPropertyName("maximumDestructuringDepth")]
		[JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
		public long? MaximumDestructuringDepth { get; set; }

		[JsonPropertyName("maximumStringLength")]
		[JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
		public long? MaximumStringLength { get; set; }

		[JsonPropertyName("maximumCollectionCount")]
		[JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
		public long? MaximumCollectionCount { get; set; }
	}

	public class MinimumLevel
	{
		[JsonPropertyName("Default")]
		public string Default { get; set; }

		[JsonPropertyName("Override")]
		public Override Override { get; set; }
	}

	public class Override
	{
		[JsonPropertyName("Microsoft")]
		public string Microsoft { get; set; }

		[JsonPropertyName("System")]
		public string System { get; set; }

		[JsonPropertyName("Microsoft.AspNetCore")]
		public string MicrosoftAspNetCore { get; set; }

		[JsonPropertyName("Microsoft.Hosting")]
		public string MicrosoftHosting { get; set; }
	}

	public class Properties
	{
		[JsonPropertyName("Application")]
		public string Application { get; set; }
	}

	public class WriteTo
	{
		[JsonPropertyName("Name")]
		public string Name { get; set; }
	}
}