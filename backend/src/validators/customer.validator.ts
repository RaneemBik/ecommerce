import { z } from "zod";

export const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80),
    email: z.string().email().max(120),
    phone: z.string().max(30).optional(),
    address: z.string().max(200).optional()
  })
});

export const updateCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80).optional(),
    email: z.string().email().max(120).optional(),
    phone: z.string().max(30).optional(),
    address: z.string().max(200).optional()
  })
});

export const listCustomersQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    sort: z.string().optional(),
    order: z.enum(["asc", "desc"]).optional(),

    // filters (multi-field)
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    isDeleted: z.enum(["true", "false"]).optional()
  })
});
