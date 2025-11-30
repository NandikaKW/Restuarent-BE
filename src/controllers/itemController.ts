import { Request, Response } from "express";
import { IItem, Item } from "../models/Item";
import cloudinary from "../config/cloudinary";
import mongoose from "mongoose";


export const viewAllItems = async (req: Request, res: Response) => {
  try {
    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 9;
    const skip = (page - 1) * limit;

    // Filters
    const search = (req.query.search as string) || "";
    const maxPrice = Number(req.query.maxPrice) || 50;
    const categories = req.query.categories
      ? req.query.categories.toString().split(",")
      : [];
    const sort = (req.query.sort as string) || "latest";

    // Build MongoDB filter object
    const filters: any = {
      price: { $lte: maxPrice },
    };

    if (search) {
      filters.title = { $regex: search, $options: "i" };
    }

    if (categories.length > 0) {
      filters.category = { $in: categories };
    }

    // Sorting
    let sortOption: any = {};
    if (sort === "latest") sortOption = { createdAt: -1 };
    else if (sort === "priceLowHigh") sortOption = { price: 1 };
    else if (sort === "priceHighLow") sortOption = { price: -1 };

    // Query DB
    const items = await Item.find(filters)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const count = await Item.countDocuments(filters);

    return res.status(200).json({
      message: "Items retrieved successfully",
      data: items,
      totalPages: Math.ceil(count / limit),
      totalCount: count,
      page,
    });
  } catch (error) {
    console.error("Error retrieving items:", error);
    return res.status(500).json({ message: "Failed to retrieve items" });
  }
}