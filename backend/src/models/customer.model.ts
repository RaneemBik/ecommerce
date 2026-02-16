import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICustomer extends Document {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 120
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 30
    },
    address: {
      type: String,
      trim: true,
      maxlength: 200
    },
    // BONUS: soft delete
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export const Customer: Model<ICustomer> =
  mongoose.models.Customer ||
  mongoose.model<ICustomer>("Customer", customerSchema);
