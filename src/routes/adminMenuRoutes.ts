import { Router } from "express";
import {
  saveItem,
  viewAllItems,
  deleteItem,
  updateItem
} from "../controllers/adminMenuController";
import { protect } from "../middleware/authMiddleware";
import { authorize } from "../middleware/authorize";
import upload from "../middleware/upload";

const router = Router();

// All admin routes require admin privileges
router.use(protect);
router.use(authorize("admin"));

router.get("/", viewAllItems);
router.post("/save", upload.single("image"), saveItem);
router.delete("/:id", deleteItem);
router.put("/:id", upload.single("image"), updateItem);

export default router;