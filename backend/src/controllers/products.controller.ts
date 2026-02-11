import { Request, Response } from "express";
import {
  createProduct,
  getProductById,
  listProducts,
  softDeleteProduct,
  updateProduct
} from "../services/products.service";

export async function create(req: Request, res: Response) {
  const product = await createProduct(req.body);
  res.status(201).json(product);
}

export async function getAll(req: Request, res: Response) {
  const result = await listProducts(req.query);
  res.status(200).json(result);
}

export async function getOne(req: Request, res: Response) {
  const product = await getProductById(req.params.id);
  res.status(200).json(product);
}

export async function update(req: Request, res: Response) {
  const product = await updateProduct(req.params.id, req.body);
  res.status(200).json(product);
}

// BONUS: soft delete
export async function remove(req: Request, res: Response) {
  const product = await softDeleteProduct(req.params.id);
  res.status(200).json(product);
}
