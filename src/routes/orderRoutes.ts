// routes/orderRoutes.ts
import { Router } from "express";
import { placeOrder, getOrderHistory } from "../controllers/orderController";
import { protect } from "../middleware/authMiddleware";
import { authorize } from "../middleware/authorize";

const router = Router();

router.use(protect);
router.use(authorize("user"));

router.post("/place", placeOrder);     // Order placement
router.get("/history", getOrderHistory); // Order history

export default router;
