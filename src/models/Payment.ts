// models/Payment.ts
import mongoose, { Document, Schema, Types } from "mongoose";

export interface IPayment extends Document {
  userId: Types.ObjectId;
  orderId: Types.ObjectId;
  amount: number;
  status: "pending" | "success" | "failed";
  orderStatus: 'pending' | 'preparing' | 'completed' | 'cancelled';
  createdAt: Date;
}

const paymentSchema = new Schema<IPayment>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
}, { timestamps: true });

export interface PaymentResponse {
  message: string;
  paymentId: string;
  amount: number;
  paymentUrl: string;
}

export interface PaymentStatus {
  message: string;
  paymentStatus: 'pending' | 'success' | 'failed';
  orderId: string;
  orderStatus: 'pending' | 'preparing' | 'completed' | 'cancelled';
}

export interface PaymentDetails {
  _id: string;
  userId: string;
  orderId: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
  updatedAt: string;
}
export const Payment = mongoose.model<IPayment>("Payment", paymentSchema);
