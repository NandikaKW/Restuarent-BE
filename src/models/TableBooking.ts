import mongoose, { Schema, Document } from "mongoose";

export interface ITableBooking extends Document {
  userId?: mongoose.Types.ObjectId; 
  userEmail: string; 
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  message?: string;
  createdAt: Date;
}

const bookingSchema = new Schema<ITableBooking>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    userEmail: { type: String, required: true }, // Track which user made the booking
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    guests: { type: Number, required: true },
    message: { type: String }
  },
  { timestamps: true }
);

// Prevent double booking on same date + time
bookingSchema.index({ date: 1, time: 1 }, { unique: true });

export const TableBooking = mongoose.model<ITableBooking>(
  "TableBooking",
  bookingSchema
);