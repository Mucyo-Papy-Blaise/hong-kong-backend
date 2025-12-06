import mongoose, { Document, Schema, Types } from "mongoose";
import { IUser } from "./User";
import { ICartItem } from "./User";

// Order status enum
export type OrderStatus = "placed" | "processing" | "shipped" | "delivered" | "cancelled";

// Order document interface
export interface IOrder extends Document {
  user: Types.ObjectId | IUser;
  items: ICartItem[];
  total: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Order schema
const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [
        {
          productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          quantity: { type: Number, required: true, min: 1, default: 1 },
          priceAtAddTime: { type: Number, required: true },
        },
      ],
      required: true,
    },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["placed", "processing", "shipped", "delivered", "cancelled"],
      default: "placed",
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>("Order", orderSchema);
