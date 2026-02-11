import { Product } from "../models/product.model";

function toNumber(val: any, def: number) {
  const n = Number(val);
  return Number.isFinite(n) ? n : def;
}

export async function createProduct(data: {
  sku: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
}) {
  const sku = data.sku.trim().toUpperCase();

  const exists = await Product.findOne({ sku });
  if (exists) {
    const err: any = new Error("SKU already exists");
    err.status = 400;
    throw err;
  }

  const product = await Product.create({
    sku,
    name: data.name.trim(),
    description: data.description?.trim(),
    price: Number(data.price),
    stock: Number(data.stock),
    category: data.category?.trim()
  });

  return product;
}

export async function getProductById(id: string) {
  const product = await Product.findById(id);
  if (!product) {
    const err: any = new Error("Product not found");
    err.status = 404;
    throw err;
  }
  return product;
}

export async function listProducts(query: any) {
  const page = Math.max(1, toNumber(query.page, 1));
  const limit = Math.min(Math.max(1, toNumber(query.limit, 10)), 100);

  const sortField = (query.sort as string) || "createdAt";
  const sortOrder = query.order === "asc" ? 1 : -1;

  const filter: any = {};

  if (query.isDeleted === "true") filter.isDeleted = true;
  else if (query.isDeleted === "false") filter.isDeleted = false;
  else filter.isDeleted = false;

  if (query.sku) filter.sku = String(query.sku).trim().toUpperCase();
  if (query.name) filter.name = { $regex: String(query.name), $options: "i" };
  if (query.category)
    filter.category = { $regex: String(query.category), $options: "i" };

  const minPrice = toNumber(query.minPrice, Number.NaN);
  const maxPrice = toNumber(query.maxPrice, Number.NaN);
  if (!Number.isNaN(minPrice) || !Number.isNaN(maxPrice)) {
    filter.price = {};
    if (!Number.isNaN(minPrice)) filter.price.$gte = minPrice;
    if (!Number.isNaN(maxPrice)) filter.price.$lte = maxPrice;
  }

  if (query.inStock === "true") filter.stock = { $gt: 0 };
  if (query.inStock === "false") filter.stock = 0;

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter)
  ]);

  return {
    items,
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  };
}

export async function updateProduct(id: string, data: any) {
  if (data.sku) data.sku = String(data.sku).trim().toUpperCase();
  if (data.name) data.name = String(data.name).trim();
  if (data.description) data.description = String(data.description).trim();
  if (data.category) data.category = String(data.category).trim();
  if (data.price !== undefined) data.price = Number(data.price);
  if (data.stock !== undefined) data.stock = Number(data.stock);

  // ensure unique sku if changed
  if (data.sku) {
    const existing = await Product.findOne({ sku: data.sku, _id: { $ne: id } });
    if (existing) {
      const err: any = new Error("SKU already exists");
      err.status = 400;
      throw err;
    }
  }

  const product = await Product.findByIdAndUpdate(id, data, { new: true });
  if (!product) {
    const err: any = new Error("Product not found");
    err.status = 404;
    throw err;
  }
  return product;
}

export async function softDeleteProduct(id: string) {
  const product = await Product.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  if (!product) {
    const err: any = new Error("Product not found");
    err.status = 404;
    throw err;
  }
  return product;
}
