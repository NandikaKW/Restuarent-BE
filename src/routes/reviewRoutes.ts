import { Router } from "express";
import {
  createReview,
  getItemReviews,
  getAllReviews,
  updateReviewStatus,
  deleteReview,
} from "../controllers/reviewController";
import { protect } from "../middleware/authMiddleware"; // your auth middleware
import { authorize } from "../middleware/authorize"; // admin guard

const router = Router();

// Public (only approved)
router.get("/item/:id", getItemReviews);

// Protected user endpoints
router.post("/", protect, createReview);

// Admin endpoints
router.get("/", protect, authorize("admin"), getAllReviews);
router.patch("/:id/status", protect, authorize("admin"), updateReviewStatus);
router.delete("/:id", protect, authorize("admin"), deleteReview);

export default router;
