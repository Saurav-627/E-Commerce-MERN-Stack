import express from 'express';
import { Product, Order, OrderItem, CartItem } from '../models/models.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Create order
router.post('/', authenticate, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, paymentStatus } = req.body;
    const userId = req.user._id;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required'
      });
    }

    // Calculate total
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findOne({ _id: item.productId, status: 'active' });
      
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product with ID ${item.productId} not found`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`
        });
      }

      const itemTotal = product.price * item.quantity;
      total += itemTotal;
      
      orderItems.push({
        product_id: product._id,
        quantity: item.quantity,
        price: product.price
      });
    }

    // Create order
    const order = new Order({
      user_id: userId,
      total,
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
      payment_status: paymentStatus
    });
    await order.save();

    // Create order items and update stock
    for (const item of orderItems) {
      await OrderItem.create({
        order_id: order._id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      });
      await Product.findByIdAndUpdate(item.product_id, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear cart
    await CartItem.deleteMany({ user_id: userId });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { orderId: order._id, total }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

// Get user orders
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const orders = await Order.find({ user_id: userId })
      .sort({ created_at: -1 })
      .lean();

    const ordersWithItems = await Promise.all(orders.map(async (order) => {
      const items = await OrderItem.find({ order_id: order._id })
        .populate('product_id', 'name images')
        .lean();
      return { ...order, items };
    }));

    res.json({
      success: true,
      data: { orders: ordersWithItems }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

// Get single order
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const order = await Order.findOne({ _id: id, user_id: userId }).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const items = await OrderItem.find({ order_id: order._id })
      .populate('product_id', 'name images')
      .lean();

    const orderWithItems = { ...order, items };

    res.json({
      success: true,
      data: { order: orderWithItems }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
});

export default router;