import { Router } from "express";
import { 
  createPayment, 
  getPaymentStatus, 
  getPaymentHistory,
  getAllPayments,
  updatePaymentStatus,
  completePayment 
} from "../controllers/paymentController";
import { protect } from "../middleware/authMiddleware";
import { authorize } from "../middleware/authorize";

const router = Router();

router.use(protect);

// Create payment
router.post("/create", authorize("user"), createPayment);

// Get payment status
router.get("/status/:paymentId", authorize("user"), getPaymentStatus);

// Get payment history
router.get("/history", authorize("user"), getPaymentHistory);

// ADMIN: Get all payments
router.get("/admin/all", authorize("admin"), getAllPayments);

// ADMIN: Update payment status
router.put("/admin/update/:paymentId", authorize("admin"), updatePaymentStatus);

// Complete payment (for demo)
router.post("/complete/:paymentId", authorize("user"), completePayment);

export default router;