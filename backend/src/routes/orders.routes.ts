import { Router } from "express";
import { validate } from "../middlewares/validate.middleware";
import {
  createOrderSchema,
  listOrdersQuerySchema,
  updateOrderSchema
} from "../validators/order.validators";
import * as orders from "../controllers/orders.controllers";

export const ordersRouter = Router();

ordersRouter.post("/", validate(createOrderSchema), orders.create);
ordersRouter.get("/", validate(listOrdersQuerySchema), orders.getAll);
ordersRouter.get("/:id", orders.getOne);
ordersRouter.put("/:id", validate(updateOrderSchema), orders.update);

// BONUS: soft delete
ordersRouter.delete("/:id", orders.remove);
