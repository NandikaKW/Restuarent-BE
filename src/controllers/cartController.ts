// controllers/cartController.ts
import { Request, Response } from "express";
import { Cart, ICartItem } from "../models/Cart";

export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    let cart = await Cart.findOne({ userId }).populate('userId', 'firstName lastName email');
    
    if (!cart) {
      cart = await Cart.create({ 
        userId, 
        items: [],
        totalPrice: 0,
        totalItems: 0
      });
    }
    
    res.status(200).json(cart);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { items } = req.body;
    
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: "Items must be an array" });
    }
    
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      cart = await Cart.create({ 
        userId, 
        items,
        totalPrice: 0,
        totalItems: 0
      });
    } else {
      cart.items = items;
      await cart.save();
    }
    
    res.status(200).json(cart);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const addToCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { menuItemId, name, price, quantity = 1, image } = req.body;
    
    if (!menuItemId || !name || !price || !image) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      cart = await Cart.create({ 
        userId, 
        items: [{ menuItemId, name, price, quantity, image }],
        totalPrice: 0,
        totalItems: 0
      });
    } else {
      const existingItemIndex = cart.items.findIndex(item => item.menuItemId === menuItemId);
      
      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        cart.items.push({ menuItemId, name, price, quantity, image });
      }
      
      await cart.save();
    }
    
    res.status(200).json(cart);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const clearCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const cart = await Cart.findOne({ userId });
    
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    
    res.status(200).json(cart || { items: [], totalPrice: 0, totalItems: 0 });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};