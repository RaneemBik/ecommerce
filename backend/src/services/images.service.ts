import fs from "fs/promises";
import path from "path";

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".svg",
  ".bmp",
  ".avif"
]);

const imagesDirectory = path.resolve(process.cwd(), "public", "images");

function isAllowedImageFile(fileName: string) {
  return IMAGE_EXTENSIONS.has(path.extname(fileName).toLowerCase());
}

export async function listImages() {
  try {
    const entries = await fs.readdir(imagesDirectory, { withFileTypes: true });

    return entries
      .filter((entry) => entry.isFile() && isAllowedImageFile(entry.name))
      .map((entry) => ({
        name: entry.name,
        url: `/api/images/${encodeURIComponent(entry.name)}`
      }));
  } catch (error: any) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

export async function getImagePathByName(fileName: string) {
  const safeName = path.basename(String(fileName));

  if (!safeName || safeName !== String(fileName) || !isAllowedImageFile(safeName)) {
    const err: any = new Error("Invalid image name");
    err.status = 400;
    throw err;
  }

  const fullPath = path.resolve(imagesDirectory, safeName);
  const imagesDirWithSep = imagesDirectory.endsWith(path.sep)
    ? imagesDirectory
    : `${imagesDirectory}${path.sep}`;

  if (!fullPath.startsWith(imagesDirWithSep)) {
    const err: any = new Error("Invalid image path");
    err.status = 400;
    throw err;
  }

  try {
    const stats = await fs.stat(fullPath);
    if (!stats.isFile()) {
      const err: any = new Error("Image not found");
      err.status = 404;
      throw err;
    }
  } catch (error: any) {
    if (error?.code === "ENOENT") {
      const err: any = new Error("Image not found");
      err.status = 404;
      throw err;
    }
    throw error;
  }

  return fullPath;
}
