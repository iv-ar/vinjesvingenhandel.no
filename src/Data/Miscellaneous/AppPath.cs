namespace VSH.Data.Miscellaneous;

public sealed record AppPath
{
	public string HostPath { get; init; }
	public string WebPath { get; init; }
}