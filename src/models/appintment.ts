import mongoose, { type Document, Schema, Types } from "mongoose";
import { IUser } from "./User";

export interface IAppointment extends Document {
  user: Types.ObjectId | IUser;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  date: Date;
  time: string;
  serviceType: string;
  status: "pending" | "approved" | "replied" | "rejected";
  adminReply?: string;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    serviceType: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "replied", "rejected"],
      default: "pending",
    },
    adminReply: { type: String },
  },
  { timestamps: true }
);

export const Appointment = mongoose.model<IAppointment>(
  "Appointment",
  appointmentSchema
);
