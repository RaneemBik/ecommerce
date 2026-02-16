import { Request, Response } from "express";
import {
  createCustomer,
  getCustomerById,
  listCustomers,
  softDeleteCustomer,
  updateCustomer
} from "../services/customers.service";

export async function create(req: Request, res: Response) {
  const customer = await createCustomer(req.body);
  res.status(201).json(customer);
}

export async function getAll(req: Request, res: Response) {
  const result = await listCustomers(req.query);
  res.status(200).json(result);
}

export async function getOne(req: Request, res: Response) {
  const customer = await getCustomerById(req.params.id);
  res.status(200).json(customer);
}

export async function update(req: Request, res: Response) {
  const customer = await updateCustomer(req.params.id, req.body);
  res.status(200).json(customer);
}

// BONUS: soft delete
export async function remove(req: Request, res: Response) {
  const customer = await softDeleteCustomer(req.params.id);
  res.status(200).json(customer);
}
