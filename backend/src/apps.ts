import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { notFound } from "./middlewares/nottFound.middleware";
import { errorHandler } from "./middlewares/errors.middleware";

import { authRouter } from "./routes/auth.route";
import { usersRouter } from "./routes/users.routes";
import { productsRouter } from "./routes/products.routes";
import { ordersRouter } from "./routes/orders.routes";
import { protect } from "./middlewares/auth.middleware";

export const app = express();

// Core middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Health check
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/users", protect, usersRouter);
app.use("/api/products", protect, productsRouter);
app.use("/api/orders", protect, ordersRouter);

// 404 + error handling
app.use(notFound);
app.use(errorHandler);
