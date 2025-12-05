import mongoose, { Document, Schema, Types } from "mongoose";

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface IReview extends Document {
  userId: Types.ObjectId;
  menuItemId: Types.ObjectId;
  rating: number;
  comment?: string;
  status: ReviewStatus;
  userName?: string;
  userEmail?: string;
  menuItemSnapshot?: {
    _id: Types.ObjectId;
    title: string;
    imageURL?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    menuItemId: { type: Schema.Types.ObjectId, ref: "Item", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 1000, default: "" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    userName: { type: String },
    userEmail: { type: String },
    menuItemSnapshot: {
      _id: { type: Schema.Types.ObjectId },
      title: { type: String },
      imageURL: { type: String },
    },
  },
  { timestamps: true }
);

export const Review = mongoose.model<IReview>("Review", ReviewSchema);
export default Review;
