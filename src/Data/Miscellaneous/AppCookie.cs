namespace VSH.Data.Miscellaneous;

public sealed record AppCookie
{
	public string Name { get; init; }
	public string Description { get; init; }
	public bool Required { get; init; }
}