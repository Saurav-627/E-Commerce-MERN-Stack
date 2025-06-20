import express from 'express';
import { User, Category, Product, Order, OrderItem } from '../models/models.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication and admin middleware to all routes
router.use(authenticate);
router.use(isAdmin);

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalOrders, totalRevenue, recentOrders, topProducts] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Product.countDocuments({ status: 'active' }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { payment_status: 'completed' } },
        { $group: { _id: null, revenue: { $sum: '$total' } } }
      ]).then(result => result[0]?.revenue || 0),
      Order.find()
        .populate('user_id', 'name')
        .sort({ created_at: -1 })
        .limit(5)
        .lean(),
      OrderItem.aggregate([
        {
          $group: {
            _id: '$product_id',
            sold: { $sum: '$quantity' }
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        { $project: { name: '$product.name', sold: 1 } },
        { $sort: { sold: -1 } },
        { $limit: 5 }
      ])
    ]);

    res.json({
      success: true,
      data: { stats: { totalUsers, totalProducts, totalOrders, totalRevenue }, recentOrders, topProducts }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
      error: error.message
    });
  }
});

// Product management
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find()
      .populate('category_id', 'name')
      .sort({ created_at: -1 })
      .lean();

    res.json({
      success: true,
      data: { products }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
});

router.post('/products', async (req, res) => {
  try {
    const { name, description, price, categoryId, stock, images, featured } = req.body;

    const product = new Product({
      name,
      description,
      price,
      category_id: categoryId,
      stock,
      images: images || [],
      featured: !!featured
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { productId: product._id }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, categoryId, stock, images, featured, status } = req.body;

    await Product.findByIdAndUpdate(id, {
      name,
      description,
      price,
      category_id: categoryId,
      stock,
      images: images || [],
      featured: !!featured,
      status,
      updated_at: new Date()
    });

    res.json({
      success: true,
      message: 'Product updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete by updating status
    await Product.findByIdAndUpdate(id, { status: 'deleted', updated_at: new Date() });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
});

// Category management
router.post('/categories', async (req, res) => {
  try {
    const { name, description, image } = req.body;

    const category = new Category({ name, description, image });
    await category.save();

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { categoryId: category._id }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
});

// Order management
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user_id', 'name email')
      .sort({ created_at: -1 })
      .lean();

    const ordersWithItems = await Promise.all(orders.map(async (order) => {
      const items = await OrderItem.find({ order_id: order._id })
        .populate('product_id', 'name')
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

router.put('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    await Order.findByIdAndUpdate(id, {
      status,
      payment_status: paymentStatus,
      updated_at: new Date()
    });

    res.json({
      success: true,
      message: 'Order updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update order',
      error: error.message
    });
  }
});

// User management
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('name email role created_at')
      .sort({ created_at: -1 })
      .lean();

    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

export default router;