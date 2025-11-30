import { Router } from "express";
import { 
  getAllOrders, 
  updateOrderStatus, 
  getOrderStats 
} from "../controllers/adminOrderController";
import { protect } from "../middleware/authMiddleware";
import { authorize } from "../middleware/authorize";

const router = Router();

// All admin routes require admin privileges
router.use(protect);
router.use(authorize("admin"));

router.get("/", getAllOrders);
router.get("/stats", getOrderStats);
router.patch("/:orderId/status", updateOrderStatus);

export default router;