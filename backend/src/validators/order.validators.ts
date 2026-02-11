import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

export const createOrderSchema = z.object({
  body: z.object({
    customerId: objectId,
    items: z
      .array(
        z.object({
          productId: objectId,
          quantity: z.number().int().min(1)
        })
      )
      .min(1)
  })
});

export const updateOrderSchema = z.object({
  body: z.object({
    status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled"]).optional()
  })
});

export const listOrdersQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    sort: z.string().optional(),
    order: z.enum(["asc", "desc"]).optional(),

    // filters
    status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled"]).optional(),
    customerId: objectId.optional(),
    isDeleted: z.enum(["true", "false"]).optional()
  })
});
