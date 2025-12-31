import mongoose, { Document, Schema, Types } from "mongoose";

export interface IPayment extends Document {
  userId: Types.ObjectId;
  orderId: Types.ObjectId;
  amount: number;
  paymentMethod: 'card' | 'paypal' | 'cash';
  cardDetails?: {
    cardNumber?: string;
    cardHolder?: string;
    expiryDate?: string;
    cvv?: string;
  };
  status: 'pending' | 'success' | 'failed';
  paymentDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
  amount: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['card', 'paypal', 'cash'], 
    default: 'card' 
  },
  cardDetails: {
    cardNumber: { type: String, select: false }, // Sensitive data, not returned by default
    cardHolder: { type: String },
    expiryDate: { type: String },
    cvv: { type: String, select: false }
  },
  status: { 
    type: String, 
    enum: ['pending', 'success', 'failed'], 
    default: 'pending' 
  },
  paymentDate: { type: Date, default: Date.now }
}, { timestamps: true });

// Add index for better query performance
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ orderId: 1 });

export const Payment = mongoose.model<IPayment>("Payment", paymentSchema);