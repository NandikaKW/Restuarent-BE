import { Router } from "express";
import {
  createBooking,
  getMyBookings,
  getAllBookings,
  cancelBooking,
} from "../controllers/bookingController";
import { protect } from "../middleware/authMiddleware";
import { authorize } from "../middleware/authorize";

const router = Router();
router.use(protect);            // must be logged in
router.use(authorize("user", "admin"));  // only user can access


// PUBLIC — Anyone can book a table
router.post("/", createBooking);

// USER — View my bookings
router.get("/my", protect, getMyBookings);

// ADMIN — View all bookings
router.get("/all", protect, getAllBookings);

// Cancel booking
router.delete("/:id", cancelBooking);

export default router;
