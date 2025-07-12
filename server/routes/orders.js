import express from 'express';
import { Product, Order, OrderItem, CartItem } from '../models/models.js';
import { authenticate } from '../middleware/auth.js';
import axios from 'axios';

const router = express.Router();
const frontendURL = process.env.CLIENT_URL || 'http://localhost:3000';

// Initiate Khalti Payment
router.post('/initiate-payment', authenticate, async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      amount,
      return_url,
      website_url,
      purchase_order_id,
      purchase_order_name,
      customer_info,
    } = req.body;
    const userId = req.user._id;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required',
      });
    }

    // Validate products and stock
    let total = 0;
    for (const item of items) {
      const product = await Product.findOne({ _id: item.productId, status: 'active' });
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product with ID ${item.productId} not found`,
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }
      total += product.price * item.quantity;
    }

    // Khalti payment initiation
    const khaltiResponse = await axios.post(
      'https://dev.khalti.com/api/v2/epayment/initiate/',
      {
        return_url,
        website_url,
        amount,
        purchase_order_id,
        purchase_order_name,
        customer_info,
      },
      {
        headers: {
          Authorization: `key ${process.env.KHALTI_TEST_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (khaltiResponse.data.pidx && khaltiResponse.data.payment_url) {
      // Store temporary order
      const tempOrder = new Order({
        user_id: userId,
        total: amount / 100,
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        payment_status: 'pending',
        khalti_pidx: khaltiResponse.data.pidx,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      });
      await tempOrder.save();

      res.json({
        success: true,
        payment_url: khaltiResponse.data.payment_url,
        pidx: khaltiResponse.data.pidx,
      });
    } else {
      throw new Error('Failed to initiate Khalti payment');
    }
  } catch (error) {
    console.error('Initiate payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate payment',
      error: error.message,
    });
  }
});

// Verify Khalti Payment Callback
router.get('/payment/verify', async (req, res) => {
  try {
    const { pidx, status, transaction_id } = req.query;

    if (!pidx) {
      return res.redirect(`${frontendURL}/orders?payment=failed&error=${encodeURIComponent('Invalid payment identifier')}`);
    }

    // Verify payment status with Khalti
    const lookupResponse = await axios.post(
      'https://dev.khalti.com/api/v2/epayment/lookup/',
      { pidx },
      {
        headers: {
          Authorization: `key ${process.env.KHALTI_TEST_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (lookupResponse.data.status !== 'Completed') {
      return res.redirect(`${frontendURL}/orders?payment=failed&error=${encodeURIComponent(`Payment not completed: ${lookupResponse.data.status}`)}`);
    }

    // Find temporary order
    const tempOrder = await Order.findOne({ khalti_pidx: pidx });
    if (!tempOrder) {
      return res.redirect(`${frontendURL}/orders?payment=failed&error=${encodeURIComponent('Order not found')}`);
    }

    const userId = tempOrder.user_id; 

    // Create order items and update stock
    const orderItems = [];
    for (const item of tempOrder.items) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        return res.redirect(`${frontendURL}/orders?payment=failed&error=${encodeURIComponent(`Invalid product or insufficient stock for ${product?.name}`)}`);
      }
      orderItems.push({
        product_id: product._id,
        quantity: item.quantity,
        price: product.price,
      });
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    // Update order status
    tempOrder.payment_status = 'completed';
    tempOrder.transaction_id = transaction_id;
    await tempOrder.save();

    // Create order items
    for (const item of orderItems) {
      await OrderItem.create({
        order_id: tempOrder._id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      });
    }

    // Clear cart
    await CartItem.deleteMany({ user_id: userId });

    res.redirect(`${frontendURL}/orders?payment=success`);
  } catch (error) {
    console.error('Payment verification error:', error);
    res.redirect(`${frontendURL}/orders?payment=failed&error=${encodeURIComponent(error.message)}`);
  }
});

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