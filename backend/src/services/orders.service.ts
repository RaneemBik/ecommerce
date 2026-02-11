import mongoose from "mongoose";
import { Order } from "../models/order.model";
import { Customer } from "../models/customer.model";
import { Product } from "../models/product.model";

function toNumber(val: any, def: number) {
  const n = Number(val);
  return Number.isFinite(n) && n > 0 ? n : def;
}

export async function createOrder(data: {
  customerId: string;
  items: { productId: string; quantity: number }[];
}) {
  // 1) ensure customer exists (and not deleted)
  const customer = await Customer.findOne({ _id: data.customerId, isDeleted: false });
  if (!customer) {
    const err: any = new Error("Customer not found");
    err.status = 404;
    throw err;
  }

  // 2) fetch all products referenced
  const productIds = data.items.map((i) => i.productId);
  const products = await Product.find({
    _id: { $in: productIds },
    isDeleted: false
  });

  if (products.length !== productIds.length) {
    const err: any = new Error("One or more products not found");
    err.status = 400;
    throw err;
  }

  // map for quick lookup
  const byId = new Map(products.map((p) => [p._id.toString(), p]));

  // 3) build order items with snapshot pricing
  const orderItems = data.items.map((i) => {
    const p = byId.get(i.productId);
    if (!p) {
      const err: any = new Error("Product not found");
      err.status = 400;
      throw err;
    }

    const unitPrice = p.price;
    const quantity = i.quantity;
    const lineTotal = unitPrice * quantity;

    return {
      productId: new mongoose.Types.ObjectId(i.productId),
      quantity,
      unitPrice,
      lineTotal
    };
  });

  const total = orderItems.reduce((sum, it) => sum + it.lineTotal, 0);

  const order = await Order.create({
    customerId: new mongoose.Types.ObjectId(data.customerId),
    items: orderItems,
    total,
    status: "pending"
  });

  return order;
}

export async function getOrderById(id: string) {
  const order = await Order.findById(id)
    .populate("customerId", "name email")
    .populate("items.productId", "name price category");

  if (!order) {
    const err: any = new Error("Order not found");
    err.status = 404;
    throw err;
  }
  return order;
}

export async function listOrders(query: any) {
  const page = toNumber(query.page, 1);
  const limit = Math.min(toNumber(query.limit, 10), 100);

  const sortField = (query.sort as string) || "createdAt";
  const sortOrder = query.order === "asc" ? 1 : -1;

  const filter: any = {};

  // default: hide deleted unless explicitly asked
  if (query.isDeleted === "true") filter.isDeleted = true;
  else if (query.isDeleted === "false") filter.isDeleted = false;
  else filter.isDeleted = false;

  if (query.status) filter.status = query.status;
  if (query.customerId) filter.customerId = query.customerId;

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Order.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .populate("customerId", "name email")
      .populate("items.productId", "name price category"),
    Order.countDocuments(filter)
  ]);

  return {
    items,
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  };
}

export async function updateOrder(id: string, data: { status?: string }) {
  const order = await Order.findByIdAndUpdate(id, data, { new: true })
    .populate("customerId", "name email")
    .populate("items.productId", "name price category");

  if (!order) {
    const err: any = new Error("Order not found");
    err.status = 404;
    throw err;
  }
  return order;
}

// BONUS: soft delete
export async function softDeleteOrder(id: string) {
  const order = await Order.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  if (!order) {
    const err: any = new Error("Order not found");
    err.status = 404;
    throw err;
  }
  return order;
}
