using VSH.Data.Enums;

namespace VSH.Data.Database;

public class Document : Base
{
	public DocumentType Type { get; set; }
	public string Content { get; set; }
}