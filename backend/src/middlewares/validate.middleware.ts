import { AnyZodObject } from "zod";
import { Request, Response, NextFunction } from "express";

export function validate(schema: AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params
    });

    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message
        }))
      });
    }

    next();
  };
}
