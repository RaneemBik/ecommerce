import { z } from "zod";

export const createProductSchema = z.object({
  body: z.object({
    sku: z.string().min(1).max(40),
    name: z.string().min(2).max(120),
    description: z.string().max(1000).optional(),
    price: z.number().nonnegative(),
    stock: z.number().int().nonnegative(),
    category: z.string().max(80).optional()
  })
});

export const updateProductSchema = z.object({
  body: z.object({
    sku: z.string().min(1).max(40).optional(),
    name: z.string().min(2).max(120).optional(),
    description: z.string().max(1000).optional(),
    price: z.number().nonnegative().optional(),
    stock: z.number().int().nonnegative().optional(),
    category: z.string().max(80).optional(),
    isDeleted: z.boolean().optional()
  })
});

export const listProductsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    sort: z.string().optional(),
    order: z.enum(["asc", "desc"]).optional(),

    sku: z.string().optional(),
    name: z.string().optional(),
    category: z.string().optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    inStock: z.enum(["true", "false"]).optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    isDeleted: z.enum(["true", "false"]).optional()
  })
});
