import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80),
    email: z.string().email().max(120),
    password: z.string().min(6).max(100)
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email().max(120),
    password: z.string().min(6).max(100)
  })
});
