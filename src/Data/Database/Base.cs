using System;

namespace VSH.Data.Database;

public class Base
{
	public Guid Id { get; set; }
	public DateTime Created { get; set; }
	public DateTime? Updated { get; set; }

	public void SetBaseValues() {
		Id = Guid.NewGuid();
		Created = DateTime.UtcNow;
	}
}