import { Request, Response } from "express";
import { Review } from "../models/Review";
import { Item } from "../models/Item"; // adjust import path if your model name differs
import mongoose from "mongoose";

interface AuthRequest extends Request {
  user?: {
    id: string;
    role?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

// Create review (user)
export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const { menuItemId, rating, comment } = req.body;
    if (!menuItemId || !rating) return res.status(400).json({ message: "menuItemId and rating required" });

    // snapshot menu item basic info (optional but helpful)
    let menuSnapshot = null;
    if (mongoose.isValidObjectId(menuItemId)) {
      const menuItem = await Item.findById(menuItemId).select("title imageURL");
      if (menuItem) menuSnapshot = { _id: menuItem._id, title: menuItem.title, imageURL: (menuItem as any).imageURL };
    }

    const review = await Review.create({
      userId: user.id,
      menuItemId,
      rating,
      comment,
      status: "pending",
      userName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
      userEmail: user.email,
      menuItemSnapshot: menuSnapshot,
    });

    return res.status(201).json({ message: "Review submitted", review });
  } catch (error) {
    console.error("createReview error:", error);
    return res.status(500).json({ message: "Failed to submit review" });
  }
};

// controllers/reviewController.ts - UPDATE getItemReviews
export const getItemReviews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const status = req.query.status as string | undefined;
    
    const filter: any = { menuItemId: id };
    if (status) filter.status = status;
    else filter.status = "approved";

    const menuItem = await Item.findById(id);
    if (!menuItem) return res.status(404).json({ message: "Item not found" });

   

    // IMPORTANT: Populate user data
    const reviews = await Review.find(filter)
      .populate("userId", "firstName lastName email") // Add this line
      .sort({ createdAt: -1 })
      .limit(50)
      .lean(); // Convert to plain objects for better performance

   
    const totalReviews = reviews.length;
    const averageRating = totalReviews 
      ? Number((reviews.reduce((s: any, r: any) => s + r.rating, 0) / totalReviews).toFixed(2))
      : 0;
    
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r: any) => {
      ratingDistribution[r.rating as keyof typeof ratingDistribution]++;
    });

    // Enhance reviews with user names
    const enhancedReviews = reviews.map((review: any) => {
      let userName = review.userName;
      let userEmail = review.userEmail;
      
      // If user data is populated, use it
      if (review.userId && typeof review.userId === 'object') {
        const user = review.userId;
        if (!userName && (user.firstName || user.lastName)) {
          userName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        }
        if (!userEmail && user.email) {
          userEmail = user.email;
        }
      }
      
      // Fallback if still no name
      if (!userName && userEmail) {
        userName = userEmail.split('@')[0];
      }
      if (!userName) {
        userName = "Anonymous Customer";
      }

      return {
        ...review,
        userName,
        userEmail: userEmail || ''
      };
    });

    return res.status(200).json({ 
      reviews: enhancedReviews, 
      averageRating, 
      totalReviews, 
      ratingDistribution 
    });
  } catch (error) {
    console.error("getItemReviews error:", error);
    return res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

// Admin - get all reviews (with pagination & optional status)
export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const status = req.query.status as string | undefined;

    const filter: any = {};
    if (status) filter.status = status;

    const total = await Review.countDocuments(filter);
    const reviews = await Review.find(filter)
      .populate("userId", "firstName lastName email")
      .populate("menuItemId", "title imageURL")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const statsAgg = await Review.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = statsAgg.reduce((acc:any, cur:any) => {
      acc[cur._id] = cur.count;
      return acc;
    }, {});

    return res.status(200).json({
      reviews,
      pagination: { page, limit, totalPages: Math.ceil(total / limit), totalReviews: total },
      stats,
    });
  } catch (error) {
    console.error("getAllReviews error:", error);
    return res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

// Admin - update review status
export const updateReviewStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' | 'rejected' | 'pending'
    if (!["approved", "rejected", "pending"].includes(status)) return res.status(400).json({ message: "Invalid status" });

    const review = await Review.findByIdAndUpdate(id, { status }, { new: true });
    if (!review) return res.status(404).json({ message: "Review not found" });

    return res.status(200).json({ message: "Status updated", review });
  } catch (error) {
    console.error("updateReviewStatus error:", error);
    return res.status(500).json({ message: "Failed to update review status" });
  }
};

// Admin - delete review
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Review.findByIdAndDelete(id);
    return res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    console.error("deleteReview error:", error);
    return res.status(500).json({ message: "Failed to delete review" });
  }
};
