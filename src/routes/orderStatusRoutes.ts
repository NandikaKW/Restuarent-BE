// routes/orderStatusRoutes.ts (NEW FILE)
import { Router } from "express";
import { getStatusExplanation } from "../controllers/orderStatusController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.post("/explain", protect, getStatusExplanation);

export default router;