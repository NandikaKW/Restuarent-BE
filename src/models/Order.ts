// models/Order.ts - Your current model is perfect
import mongoose, { Document, Schema, Types } from "mongoose";

export interface IOrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface IOrder extends Document {
  userId: Types.ObjectId;
  items: IOrderItem[];
  totalPrice: number;
  totalItems: number;
  status: string;
  createdAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [{ 
      menuItemId: String,
      name: String,
      price: Number,
      quantity: Number,
      image: String
    }],
    totalPrice: { type: Number, required: true },
    totalItems: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "preparing", "completed", "cancelled"],
      default: "pending"
    }
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>("Order", orderSchema);

// Client (browser/mobile app)
//         |
//         v
// Controller (your functions like getAllOrders, updateOrderStatus)
//         |
//         v
// Model (Order) <-- Mongoose provides schema + methods
//         |
//         v
// MongoDB Database (stores the actual data)
