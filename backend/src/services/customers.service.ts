import { Customer } from "../models/customer.model";

function toNumber(val: any, def: number) {
  const n = Number(val);
  return Number.isFinite(n) && n > 0 ? n : def;
}

export async function createCustomer(data: {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}) {
  const email = data.email.toLowerCase().trim();

  const exists = await Customer.findOne({ email });
  if (exists) {
    const err: any = new Error("Customer email already exists");
    err.status = 400;
    throw err;
  }

  const customer = await Customer.create({
    name: data.name.trim(),
    email,
    phone: data.phone?.trim(),
    address: data.address?.trim()
  });

  return customer;
}

export async function getCustomerById(id: string) {
  const customer = await Customer.findById(id);
  if (!customer) {
    const err: any = new Error("Customer not found");
    err.status = 404;
    throw err;
  }
  return customer;
}

export async function listCustomers(query: any) {
  const page = toNumber(query.page, 1);
  const limit = Math.min(toNumber(query.limit, 10), 100);

  const sortField = (query.sort as string) || "createdAt";
  const sortOrder = query.order === "asc" ? 1 : -1;

  const filter: any = {};

  // default: hide soft-deleted unless explicitly asked
  if (query.isDeleted === "true") filter.isDeleted = true;
  else if (query.isDeleted === "false") filter.isDeleted = false;
  else filter.isDeleted = false;

  if (query.name) filter.name = { $regex: String(query.name), $options: "i" };
  if (query.email) filter.email = { $regex: String(query.email), $options: "i" };
  if (query.phone) filter.phone = { $regex: String(query.phone), $options: "i" };

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Customer.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit),
    Customer.countDocuments(filter)
  ]);

  return {
    items,
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  };
}

export async function updateCustomer(id: string, data: any) {
  if (data.email) data.email = String(data.email).toLowerCase().trim();
  if (data.name) data.name = String(data.name).trim();
  if (data.phone) data.phone = String(data.phone).trim();
  if (data.address) data.address = String(data.address).trim();

  // Ensure unique email if changing it
  if (data.email) {
    const existing = await Customer.findOne({ email: data.email, _id: { $ne: id } });
    if (existing) {
      const err: any = new Error("Customer email already exists");
      err.status = 400;
      throw err;
    }
  }

  const customer = await Customer.findByIdAndUpdate(id, data, { new: true });
  if (!customer) {
    const err: any = new Error("Customer not found");
    err.status = 404;
    throw err;
  }
  return customer;
}

// BONUS: soft delete
export async function softDeleteCustomer(id: string) {
  const customer = await Customer.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  if (!customer) {
    const err: any = new Error("Customer not found");
    err.status = 404;
    throw err;
  }
  return customer;
}
