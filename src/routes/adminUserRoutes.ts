import { Router } from "express";
import { 
  getAllUsers, 
  getUserById, 
  updateUserRole, 
  deleteUser,
  getUserStats,
  createUser 
} from "../controllers/adminUserController";
import { protect } from "../middleware/authMiddleware";
import { authorize } from "../middleware/authorize";

const router = Router();

// All admin routes require admin privileges
router.use(protect);
router.use(authorize("admin"));

router.get("/", getAllUsers);
router.get("/stats", getUserStats);
router.get("/:userId", getUserById);
router.patch("/:userId/role", updateUserRole);
router.delete("/:userId", deleteUser);
router.post("/", createUser);

export default router;