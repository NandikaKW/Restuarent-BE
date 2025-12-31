import { Request, Response } from "express";
import { Payment } from "../models/Payment";
import { Order } from "../models/Order";
import { User } from "../models/User";


export const createPayment = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { orderId, paymentMethod, cardDetails } = req.body;

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if order belongs to user
    if (order.userId.toString() !== user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ orderId });
    if (existingPayment) {
      return res.status(400).json({ message: "Payment already exists for this order" });
    }

    // Create payment record with pending status for all methods
    const payment = new Payment({
      userId: user.id,
      orderId,
      amount: order.totalPrice,
      paymentMethod,
      cardDetails: paymentMethod === 'card' ? cardDetails : undefined,
      status: 'pending' // Always pending initially
    });

    await payment.save();

    // Link payment to order immediately
    order.paymentId = payment._id;
    await order.save();

    // // Simulate payment processing for demo
    // // In real implementation, this would be handled by payment gateway callback
    // setTimeout(async () => {
    //   if (paymentMethod === 'card') {
    //     // Simulate card payment success after 2 seconds
    //     payment.status = 'success';
    //     payment.paymentDate = new Date();
    //     await payment.save();
        
    //     // Order status remains 'pending' until admin changes it
    //   } else {
    //     // For other methods, status remains pending
    //     // Admin will update status manually
    //   }
    // }, 2000);

    res.status(201).json({
      message: "Payment initiated successfully",
      payment: {
        id: payment._id,
        orderId: payment.orderId,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        status: payment.status
      }
    });
  } catch (error: any) {
    console.error("Payment creation error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get payment status
export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Check if payment belongs to user or user is admin
    if (payment.userId.toString() !== user.id && user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json({
      paymentId: payment._id,
      orderId: payment.orderId,
      amount: payment.amount,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      paymentDate: payment.paymentDate
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get user's payment history
export const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const payments = await Payment.find({ userId: user.id })
      .select('-cardDetails.cvv -cardDetails.cardNumber')
      .sort({ createdAt: -1 })
      .populate('orderId', 'totalPrice status');

    res.json(payments);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ADMIN: Get all payments
export const getAllPayments = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }

    const payments = await Payment.find()
      .select('-cardDetails.cvv -cardDetails.cardNumber')
      .sort({ createdAt: -1 })
      .populate('orderId', 'totalPrice status')
      .populate('userId', 'firstName lastName email');

    res.json(payments);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ADMIN: Update payment status
export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { paymentId } = req.params;
    const { status } = req.body;

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }

    if (!['pending', 'success', 'failed'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    payment.status = status;
    if (status === 'success') {
      payment.paymentDate = new Date();
    }
    await payment.save();

    res.json({
      message: "Payment status updated successfully",
      payment: {
        id: payment._id,
        status: payment.status,
        paymentDate: payment.paymentDate
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Complete payment (for demo)
export const completePayment = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Update payment status to success
    payment.status = 'success';
    payment.paymentDate = new Date();
    await payment.save();

    

    res.json({
      message: "Payment completed successfully",
      payment: {
        id: payment._id,
        status: payment.status,
        paymentDate: payment.paymentDate
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};