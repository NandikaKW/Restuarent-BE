// controllers/paymentController.ts
import { Request, Response } from "express";
import { Payment } from "../models/Payment";
import { Order } from "../models/Order";

// controllers/paymentController.ts - Update the initiatePayment function
export const initiatePayment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Check if order is already paid
    if (order.status !== 'pending') {
      return res.status(400).json({ 
        message: `Order is already ${order.status}` 
      });
    }

    // Check if payment already exists for this order
    const existingPayment = await Payment.findOne({ orderId, status: 'pending' });
    if (existingPayment) {
      return res.status(200).json({
        message: "Payment already initiated",
        paymentId: existingPayment._id,
        amount: existingPayment.amount,
        paymentUrl: `/payment/${existingPayment._id}` 
      });
    }

    // Create a new payment
    const payment = await Payment.create({
      userId,
      orderId,
      amount: order.totalPrice,
      status: "pending"
    });

    res.status(201).json({
      message: "Payment initiated successfully",
      paymentId: payment._id.toString(),  // Ensure it's a string
      amount: payment.amount,
      paymentUrl: `/payment/${payment._id}`  // Return relative path only
    });
  } catch (error: any) {
    console.error('Error initiating payment:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

export const completePayment = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId).populate("orderId");
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    // Check if payment is already processed
    if (payment.status !== 'pending') {
      return res.status(400).json({ 
        message: `Payment already ${payment.status}`,
        paymentStatus: payment.status,
        orderId: payment.orderId
      });
    }

    // Simulate random success/failure
    const isSuccess = Math.random() > 0.1; // 90% success rate

    payment.status = isSuccess ? "success" : "failed";
    await payment.save();

    if (isSuccess) {
      // Update order status to 'preparing' on successful payment
      await Order.findByIdAndUpdate(payment.orderId, { 
        status: 'preparing',
        paymentId: payment._id
      });
    }

    const order = await Order.findById(payment.orderId);

    res.status(200).json({
      message: isSuccess ? "Payment successful" : "Payment failed",
      paymentStatus: payment.status,
      orderId: payment.orderId,
      orderStatus: order?.status || 'pending'
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const userId = (req as any).user.id;

    const payment = await Payment.findById(paymentId)
      .populate('orderId')
      .populate('userId');

    if (!payment) return res.status(404).json({ message: "Payment not found" });

    // Check if user is authorized to view this payment
    if (payment.userId._id.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to view this payment" });
    }

    res.status(200).json({
      paymentId: payment._id,
      amount: payment.amount,
      status: payment.status,
      orderId: payment.orderId,
      createdAt: payment.createdAt,
      orderStatus: (payment.orderId as any).status
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};