namespace VSH.Data.Results;

public class ErrorResult
{
	public ErrorResult(string title = default, string message = default) {
		Title = title;
		Message = message;
	}

	public string Title { get; set; }
	public string Message { get; set; }
}