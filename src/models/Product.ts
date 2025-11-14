import mongoose, { type Document, Schema } from "mongoose"

// Product document interface
export interface IProduct extends Document {
  name: string
  brand?: mongoose.Types.ObjectId; 
  price: number
  originalPrice?: number
  rating: number
  images: string[]
  description: string
  shape: string,
  lensType: mongoose.Types.ObjectId[],
  features: string[]
  specifications: Map<string, string>
  relatedProducts: mongoose.Types.ObjectId[]
  gender?: string
  createdAt: Date
  updatedAt: Date
}

// Product schema
const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    brand: { 
      type: Schema.Types.ObjectId, 
      ref: "Brand" 
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    shape: {
      type: String,
      min: 0,
    },
    lensType: {
      type: [Schema.Types.ObjectId], 
      ref: "Lenses" 
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    
    images: [
      {
        type: String,
        required: true,
      },
    ],
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    features: [String],
    specifications: {
      type: Map,
      of: String,
    },
    relatedProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    gender: {
      type: String,
      enum: ["men", "women", "unisex"],
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for filtering and searching
productSchema.index({ brand: 1 })
productSchema.index({ price: 1 })
productSchema.index({ name: "text", description: "text" })

export const Product = mongoose.model<IProduct>("Product", productSchema)
