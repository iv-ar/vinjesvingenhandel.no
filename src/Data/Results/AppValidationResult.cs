using System;
using System.Collections.Generic;
using System.Linq;

namespace VSH.Data.Results;

public class AppValidationResult
{
	public AppValidationResult() {
		Errors = new List<ValidationError>();
	}

	public bool IsValid => !Errors.Any();
	public List<ValidationError> Errors { get; set; }


	public class ValidationError
	{
		public ValidationError(Guid id = default) {
			Id = id != default ? id : null;
			Errors = new List<string>();
		}

		public Guid? Id { get; set; }
		public List<string> Errors { get; set; }
	}
}