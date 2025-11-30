import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

export const protect = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Not authorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    //attach user to request
    (req as any).user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};
