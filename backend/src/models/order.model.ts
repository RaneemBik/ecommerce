import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

export interface IOrderItem {
  productId: Types.ObjectId;
  quantity: number;
  unitPrice: number; // snapshot at time of order
  lineTotal: number; // unitPrice * quantity
}

export interface IOrder extends Document {
  customerId: Types.ObjectId;
  items: IOrderItem[];
  status: OrderStatus;
  total: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    items: { type: [orderItemSchema], required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
      default: "pending"
    },
    total: { type: Number, required: true, min: 0 },
    // BONUS soft delete
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);
