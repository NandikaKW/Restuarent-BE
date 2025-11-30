// controllers/orderController.ts
import { Request, Response } from "express";
import { Cart } from "../models/Cart";
import { Order } from "../models/Order";

export const placeOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const order = await Order.create({
      userId,
      items: cart.items,
      totalPrice: cart.totalPrice,
      totalItems: cart.totalItems,
      status: "pending"
    });

    // Clear cart
    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;
    await cart.save();

    res.status(201).json({
      message: "Order placed successfully",
      order
    });

  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getOrderHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
