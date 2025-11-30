import mongoose, { Document, Schema } from "mongoose";

export interface IItem extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    description: string;
    price: number;
    imageURL: string;
    createdAt: Date;
}

const itemSchema = new Schema<IItem>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    imageURL: { type: String, required: false },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const Item = mongoose.model<IItem>("Item", itemSchema);