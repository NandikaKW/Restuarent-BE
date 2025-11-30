// models/Cart.ts
import mongoose, { Document, Schema, Types } from "mongoose";

export interface ICartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface ICart extends Document {
  userId: Types.ObjectId;
  items: ICartItem[];
  totalPrice: number;
  totalItems: number;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>({
  menuItemId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String, required: true }
});

const cartSchema = new Schema<ICart>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  items: [cartItemSchema],
  totalPrice: { type: Number, default: 0 },
  totalItems: { type: Number, default: 0 }
}, { 
  timestamps: true,
 toJSON: {
  transform: function(doc, ret: { [key: string]: any } | null) {
    if (ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
    return ret;
  }
}
});

// Calculate totals before saving
cartSchema.pre('save', function(next) {
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  this.totalPrice = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  next();
});

export const Cart = mongoose.model<ICart>("Cart", cartSchema);