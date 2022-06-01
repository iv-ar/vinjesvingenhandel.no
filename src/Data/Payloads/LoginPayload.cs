namespace VSH.Data.Payloads;

public record LoginPayload
{
	public string Username { get; set; }
	public string Password { get; set; }
	public bool Persist { get; set; }
}