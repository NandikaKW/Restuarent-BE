// routes/paymentRoutes.ts
import { Router } from "express";
import { 
  initiatePayment, 
  completePayment, 
  getPaymentStatus 
} from "../controllers/paymentController";
import { protect } from "../middleware/authMiddleware";
import { authorize } from "../middleware/authorize";

const router = Router();

router.use(protect);

// Initiate payment (users only)
router.post("/initiate", authorize("user"), initiatePayment);

// Get payment status (users only)
router.get("/status/:paymentId", authorize("user"), getPaymentStatus);

// Complete payment (simulated) - public endpoint for simulation
router.get("/complete/:paymentId", completePayment);

export default router;