import { Request, Response } from "express";
import { TableBooking } from "../models/TableBooking";

// CREATE BOOKING
export const createBooking = async (req: Request, res: Response) => {
  const user = (req as any).user; // Get user from token if logged in
  const { name, email, phone, date, time, guests, message } = req.body;

  if (!name || !email || !phone || !date || !time || !guests) {
    return res.status(400).json({ message: "All required fields must be filled" });
  }

  try {
    // Check if time slot is available
    const existing = await TableBooking.findOne({ date, time });
    if (existing) {
      return res.status(400).json({
        message: "This time slot is already booked! Please choose another."
      });
    }

    const booking = new TableBooking({
      userId: user?.id || null, // Include userId if user is logged in
      userEmail: email, // Always store the booking email
      name,
      email,
      phone,
      date,
      time,
      guests,
      message
    });

    await booking.save();

    res.status(201).json({
      message: "Table booked successfully!",
      booking
    });
  } catch (error: any) {
    // Handle duplicate key error specifically
    if (error.code === 11000) {
      return res.status(400).json({
        message: "This time slot is already booked! Please choose another."
      });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET USER BOOKINGS 
export const getMyBookings = async (req: Request, res: Response) => {
  const user = (req as any).user;

  try {
    let bookings;
    
    if (user) {
      // If user is logged in, get bookings by userId OR userEmail
      bookings = await TableBooking.find({
        $or: [
          { userId: user.id },
          { userEmail: user.email }
        ]
      }).sort({ createdAt: -1 });
    } else {
      // For non-logged in users, they can't view bookings
      return res.status(401).json({ message: "Please log in to view your bookings" });
    }
    
    res.json(bookings);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ADMIN: GET ALL BOOKINGS
export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await TableBooking.find().sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// CANCEL BOOKING - Modified to check ownership
export const cancelBooking = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as any).user;

  try {
    const booking = await TableBooking.findById(id);
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user owns this booking (by userId OR email)
    const userOwnsBooking = user && (
      (booking.userId && booking.userId.toString() === user.id) ||
      booking.email === user.email
    );

    if (!userOwnsBooking && user?.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized to cancel this booking" });
    }

    await TableBooking.findByIdAndDelete(id);
    res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};