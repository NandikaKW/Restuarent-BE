import { Request, Response } from "express";
import { IItem, Item } from "../models/Item";
import cloudinary from "../config/cloudinary";

export const saveItem = async (req: Request, res: Response) => {
  try {
    const { title, description, price } = req.body;
    
    

    if (!title || !description || !price) {
      return res.status(400).json({ message: "Title, description, and price are required" });
    }

    let imageURL = "";

    if (req.file) {
      const result:any = await new Promise((resolve, reject) => {
        const upload_stream = cloudinary.uploader.upload_stream(
          { folder: "foodshop/items" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        
        upload_stream.end(req.file?.buffer)
      });

      imageURL = result.secure_url;
    }

    const newPost = new Item({
      title,
      description,
      price,
      imageURL
    });

    await newPost.save();

    return res.status(201).json({
      message: "Post created successfully",
      post: newPost,
    });
  } catch (error) {
    console.error("Error saving post:", error);
    return res.status(500).json({ message: "Failed to create post" });
  }
};


export const viewAllItems = async (req: Request, res: Response) => {
  try {
    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 9;
    const skip = (page - 1) * limit;

    // Query DB
    const items = await Item.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const count = await Item.countDocuments();

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

export const deleteItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Item ID is required" });
    }

    // Check if item exists
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Delete from database
    await Item.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting item:", error);
    return res.status(500).json({ message: "Failed to delete item" });
  }
};
export const updateItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, price } = req.body;

    // Check item exists
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    let imageURL = item.imageURL; // keep old image unless new uploaded

    // If a new image was uploaded, upload to Cloudinary
    if (req.file) {
      const result: any = await new Promise((resolve, reject) => {
        const upload_stream = cloudinary.uploader.upload_stream(
          { folder: "foodshop/items" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        upload_stream.end(req.file?.buffer);
      });

      imageURL = result.secure_url;
    }

    // Update item
    item.title = title ?? item.title;
    item.description = description ?? item.description;
    item.price = price ?? item.price;
    item.imageURL = imageURL;

    await item.save();

    return res.status(200).json({
      message: "Item updated successfully",
      item,
    });

  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({ message: "Failed to update item" });
  }
};
