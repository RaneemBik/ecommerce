import { Request, Response } from "express";
import {
  createOrder,
  getOrderById,
  listOrders,
  softDeleteOrder,
  updateOrder
} from "../services/orders.service";

export async function create(req: Request, res: Response) {
  const order = await createOrder(req.body);
  res.status(201).json(order);
}

export async function getAll(req: Request, res: Response) {
  const result = await listOrders(req.query);
  res.status(200).json(result);
}

export async function getOne(req: Request, res: Response) {
  const order = await getOrderById(req.params.id);
  res.status(200).json(order);
}

export async function update(req: Request, res: Response) {
  const order = await updateOrder(req.params.id, req.body);
  res.status(200).json(order);
}

// BONUS: soft delete
export async function remove(req: Request, res: Response) {
  const order = await softDeleteOrder(req.params.id);
  res.status(200).json(order);
}
