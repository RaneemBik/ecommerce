import { Request, Response } from "express";
import { getImagePathByName, listImages } from "../services/images.service";

export async function getAll(req: Request, res: Response) {
  const images = await listImages();
  res.status(200).json({ items: images, total: images.length });
}

export async function getOne(req: Request, res: Response) {
  const imagePath = await getImagePathByName(req.params.fileName);
  res.sendFile(imagePath);
}
