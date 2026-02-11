import { Router } from "express";
import { validate } from "../middlewares/validate.middleware";
import {
  createCustomerSchema,
  listCustomersQuerySchema,
  updateCustomerSchema
} from "../validators/customer.validator";
import * as customers from "../controllers/customers.controller";

export const usersRouter = Router();

// Admin-managed Customers (called "users" in routes per requirements)
usersRouter.post("/", validate(createCustomerSchema), customers.create);
usersRouter.get("/", validate(listCustomersQuerySchema), customers.getAll);
usersRouter.get("/:id", customers.getOne);
usersRouter.put("/:id", validate(updateCustomerSchema), customers.update);

// BONUS: soft delete
usersRouter.delete("/:id", customers.remove);
