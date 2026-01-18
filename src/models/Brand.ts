import mongoose, { type Document, Schema } from "mongoose"

// Brand document interface
export interface IBrand extends Document {
  name: string
  logo: string
  slug: string
  link?: string
  createdAt: Date
  updatedAt: Date
}

// Brand schema
const brandSchema = new Schema<IBrand>(
  {
    name: {
      type: String,
      required: [true, "Brand name is required"],
      unique: true,
      trim: true,
    },
    logo: {
      type: String,
      required: [true, "Brand logo is required"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    link: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)


export const Brand = mongoose.model<IBrand>("Brand", brandSchema)
