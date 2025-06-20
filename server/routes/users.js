import express from 'express';
import { Product, CartItem } from '../models/models.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get cart items
router.get('/cart', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const cartItems = await CartItem.find({ user_id: userId })
      .populate('product_id', 'name price images stock')
      .lean();

    res.json({
      success: true,
      data: { cartItems }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart',
      error: error.message
    });
  }
});

// Add to cart
router.post('/cart', authenticate, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user._id;

    // Check if product exists
    const product = await Product.findOne({ _id: productId, status: 'active' });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check stock
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    // Check if item already in cart
    const existingItem = await CartItem.findOne({ user_id: userId, product_id: productId });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock'
        });
      }

      await CartItem.findOneAndUpdate(
        { user_id: userId, product_id: productId },
        { quantity: newQuantity }
      );
    } else {
      // Add new item
      await CartItem.create({ user_id: userId, product_id: productId, quantity });
    }

    res.json({
      success: true,
      message: 'Item added to cart'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add to cart',
      error: error.message
    });
  }
});

// Update cart item
router.put('/cart/:productId', authenticate, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user._id;

    if (quantity <= 0) {
      // Remove item
      await CartItem.deleteOne({ user_id: userId, product_id: productId });
    } else {
      // Check stock
      const product = await Product.findById(productId);
      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock'
        });
      }

      await CartItem.findOneAndUpdate(
        { user_id: userId, product_id: productId },
        { quantity }
      );
    }

    res.json({
      success: true,
      message: 'Cart updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update cart',
      error: error.message
    });
  }
});

// Remove from cart
router.delete('/cart/:productId', authenticate, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    await CartItem.deleteOne({ user_id: userId, product_id: productId });

    res.json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to remove from cart',
      error: error.message
    });
  }
});

export default router;