using System;
using System.Diagnostics;
using System.IO;
using ImageMagick;
using IOL.Helpers;
using VSH.Data.Static;

namespace VSH.Utilities;

public static class ImageFunctions
{
	private static MagickGeometry SmallGeometry => new(300);
	private static MagickGeometry MiniGeometry => new(150);
	private static MagickGeometry NormalGeometry => new(1280, 720);

	public static void CreateProductImageCollection(FileInfo path) {
		try {
			using var image = new MagickImage(path);
			if (image.Width > NormalGeometry.Width) {
				image.Resize(NormalGeometry);
				image.Write(path);
			}

			Debug.WriteLine(path.Name);

			if (image.Width > SmallGeometry.Width) {
				var fileName = Path.Combine(path.DirectoryName ?? AppPaths.ProductImages.HostPath,
											path.Name.ExtractFileName() + "-300" + path.Extension);
				if (!File.Exists(fileName)) {
					image.Resize(SmallGeometry);
					image.Write(fileName);
				}
			}

			if (image.Width > MiniGeometry.Width) {
				var fileName = Path.Combine(path.DirectoryName ?? AppPaths.ProductImages.HostPath,
											path.Name.ExtractFileName() + "-150" + path.Extension);
				if (!File.Exists(fileName)) {
					image.Resize(MiniGeometry);
					image.Write(fileName);
				}
			}
		} catch (Exception e) {
			Console.WriteLine(e);
			throw;
		}
	}

	public static void EnsureNormalOrLessImageResolution(FileInfo path) {
		try {
			using var image = new MagickImage(path);
			if (image.Width <= NormalGeometry.Width)
				return;
			image.Resize(NormalGeometry);
			image.Write(path);
		} catch (Exception e) {
			Console.WriteLine(e);
			throw;
		}
	}
}