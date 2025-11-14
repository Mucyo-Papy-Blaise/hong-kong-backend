import mongoose, {type Document, Schema} from "mongoose";

export interface ILenses extends Document {
    name: string
    description: string
    features: string[],
    benefits: string,
    price: number,
    image: string
}

const lensesSchema = new Schema<ILenses>({
    name:{type: String, required: true, trim: true},
    description:{type: String, required: [true, "Description is required"],},
    benefits:{type: String},
    features: [String],
    price: {type: Number,required: [true, "Price is required"],min: 0,},
    image: {type: String,required: [true, "Brand logo is required"],}
})

export const Lenses = mongoose.model<ILenses>('Lenses', lensesSchema)