import { Router } from "express";
import * as images from "../controllers/images.controller";

export const imagesRouter = Router();

imagesRouter.get("/", images.getAll);
imagesRouter.get("/:fileName", images.getOne);
