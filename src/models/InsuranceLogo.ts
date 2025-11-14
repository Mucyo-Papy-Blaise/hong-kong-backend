import mongoose, { type Document, Schema } from "mongoose"

// Insurance logo document interface
export interface IInsuranceLogo extends Document {
  name: string
  logo: string | null
  createdAt: Date
  updatedAt: Date
}

// Insurance logo schema
const insuranceLogoSchema = new Schema<IInsuranceLogo>(
  {
    name: {
      type: String,
      required: [true, "Insurance name is required"],
      trim: true,
    },
    logo: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

export const InsuranceLogo = mongoose.model<IInsuranceLogo>("InsuranceLogo", insuranceLogoSchema)
