// routes/cartRoutes.ts
import { Router } from "express";
import { getCart, updateCart, addToCart, clearCart } from "../controllers/cartController";
import { protect } from "../middleware/authMiddleware";
import { authorize } from "../middleware/authorize";

const router = Router();

router.use(protect);            // must be logged in
router.use(authorize("user"));  // only user can access



router.get("/", getCart);
router.put("/", updateCart);
router.post("/add", addToCart);
router.delete("/clear", clearCart);

export default router;