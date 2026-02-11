import { Router } from "express";
import { validate } from "../middlewares/validate.middleware";
import {
  createProductSchema,
  listProductsQuerySchema,
  updateProductSchema
} from "../validators/products.validators";
import * as products from "../controllers/products.controller";

export const productsRouter = Router();

productsRouter.post("/", validate(createProductSchema), products.create);
productsRouter.get("/", validate(listProductsQuerySchema), products.getAll);
productsRouter.get("/:id", products.getOne);
productsRouter.put("/:id", validate(updateProductSchema), products.update);

// BONUS: soft delete
productsRouter.delete("/:id", products.remove);
