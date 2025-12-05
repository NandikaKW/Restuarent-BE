import express, { Application, Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import cartRoutes from "./routes/cartRoutes";
import itemRoutes from "./routes/itemRoutes";
import orderRoutes from "./routes/orderRoutes";
import adminOrderRoutes from "./routes/adminOrderRoutes";
import adminMenuRoutes from "./routes/adminMenuRoutes";
import adminUserRoutes from "./routes/adminUserRoutes";
import reviewRoutes from "./routes/reviewRoutes";

dotenv.config();

const app: Application = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/menu", adminMenuRoutes);
app.use("/api/admin/users", adminUserRoutes);

app.use("/api/reviews", reviewRoutes);

// Default route
app.get("/", (req: Request, res: Response) => {
  res.send("API is running...");
});

const PORT = process.env.SERVER_PORT || 5000;
const MONGO_URI = process.env.MONGO_URI as string;
console.log("MONGO_URI:", process.env.MONGO_URI);

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((error) => console.error("❌ Error connecting to MongoDB:", error));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
