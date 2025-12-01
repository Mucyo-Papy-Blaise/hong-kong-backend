import { Schema, model } from "mongoose";
import { IClient } from "../types";

const PurchasedProductSchema = new Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    subtotal: { type: Number, required: true },
  },
  { _id: false }
);

const ClientSchema = new Schema<IClient>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    purchases: { type: [PurchasedProductSchema], default: [] },
    totalPurchases: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Client = model<IClient>("Client", ClientSchema);