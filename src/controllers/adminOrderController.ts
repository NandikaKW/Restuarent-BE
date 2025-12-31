import { Request, Response } from "express";
import { Order } from "../models/Order";

// In your getAllOrders controller
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'firstName lastName email')
      .populate('paymentId', 'status paymentMethod amount paymentDate') // Add this line
      .sort({ createdAt: -1 });

    // console.log("===== ADMIN ORDERS =====");
    // console.log(JSON.stringify(orders, null, 2));
    // console.log("===== END ORDERS =====");

    res.status(200).json(orders);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update order status
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!["pending", "preparing", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate('userId', 'firstName lastName email');

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order status updated successfully",
      order
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get order statistics for admin dashboard
export const getOrderStats = async (req: Request, res: Response) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const preparingOrders = await Order.countDocuments({ status: "preparing" });
    const completedOrders = await Order.countDocuments({ status: "completed" });

    // Calculate today's revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayOrders = await Order.find({
      createdAt: { $gte: today, $lt: tomorrow },
      status: { $ne: "cancelled" }
    });

    const todayRevenue = todayOrders.reduce((total, order) => total + order.totalPrice, 0);

    res.status(200).json({
      totalOrders,
      pendingOrders,
      preparingOrders,
      completedOrders,
      todayRevenue: Math.round(todayRevenue * 100) / 100
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};