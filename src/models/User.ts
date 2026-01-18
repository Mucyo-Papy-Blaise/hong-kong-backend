import mongoose, { type Document, Schema, Types } from "mongoose"
import type { UserRole } from "../types"

// Cart item subdocument interface
export interface ICartItem {
  productId: mongoose.Types.ObjectId
  quantity: number
  priceAtAddTime: number
}

// User document interface
export interface IUser extends Document {
  name: string
  email: string
  image?: string
  password: string
  role: UserRole
  cart: Types.DocumentArray<ICartItem>
  wishlist: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

// Cart item schema
const cartItemSchema = new Schema<ICartItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  priceAtAddTime: {
    type: Number,
    required: true,
  },
})

// User schema
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    image: {type: String},

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    cart: [cartItemSchema],
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
  },
)

export const User = mongoose.model<IUser>("User", userSchema)
