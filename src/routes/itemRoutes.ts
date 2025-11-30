import { Router } from "express";
import { viewAllItems } from "../controllers/itemController";
import upload from "../middleware/upload";
import { protect } from "../middleware/protect";
import { authorize } from "../middleware/authorize";

const router = Router();

router.get("/", viewAllItems);

export default router;