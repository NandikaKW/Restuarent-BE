import mongoose, { Document, Schema, Types } from "mongoose";

export interface IOrder extends Document {
  userId: Types.ObjectId;
  items: {
    menuItemId: Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  totalPrice: number;
  totalItems: number;
  status: "pending" | "preparing" | "completed" | "cancelled";
  paymentId?: Types.ObjectId; // Add this line
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        menuItemId: { type: Schema.Types.ObjectId, ref: "MenuItem", required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        image: { type: String, required: true }
      }
    ],
    totalPrice: { type: Number, required: true },
    totalItems: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "preparing", "completed", "cancelled"],
      default: "pending"
    },
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment", default: null } // Add this line
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>("Order", orderSchema);