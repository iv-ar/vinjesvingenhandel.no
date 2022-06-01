using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using IOL.Helpers;
using Microsoft.AspNetCore.Mvc;
using VSH.Data;
using VSH.Data.Database;
using VSH.Data.Enums;
using VSH.Data.Static;
using VSH.Utilities;

namespace VSH.Controllers;

public class DocumentsController : MainControllerBase
{
	private readonly MainDbContext _context;

	public DocumentsController(MainDbContext context) {
		_context = context;
	}

	[HttpGet("{type}")]
	public ActionResult GetDocument(DocumentType type) {
		var document = _context.Documents.SingleOrDefault(d => d.Type == type);
		return Ok(document?.Content);
	}

	[HttpPost("{type}")]
	public ActionResult UpdateDocument([FromRoute] DocumentType type, [FromForm] string content) {
		var document = _context.Documents.SingleOrDefault(d => d.Type == type);
		if (document == default) {
			var newDocument = new Document {
					Content = content,
					Type = type,
					Created = DateTime.UtcNow
			};
			_context.Documents.Add(newDocument);
			_context.SaveChanges();
			return Ok(newDocument.Content);
		}

		document.Content = content;
		document.Updated = DateTime.UtcNow;
		_context.SaveChanges();
		return Ok(document.Content);
	}

	[HttpPost("upload-images")]
	public ActionResult UploadImages() {
		var files = Request.Form.Files;
		if (files.Count == 0)
			return BadRequest();
		var filePaths = new List<FileInfo>();
		var fileNames = new List<string>();
		foreach (var file in files) {
			var fileName = RandomString.Generate(4,
												 true)
						   + "_"
						   + file.FileName;
			var filePath = Path.Combine(AppPaths.DocumentImages.HostPath,
										fileName);
			using var writeStream = new FileStream(filePath,
												   FileMode.CreateNew);
			file.CopyTo(writeStream);
			filePaths.Add(new FileInfo(filePath));
			fileNames.Add(fileName);
		}

		foreach (var filePath in filePaths) {
			ImageFunctions.EnsureNormalOrLessImageResolution(filePath);
		}

		return Ok(fileNames);
	}
}