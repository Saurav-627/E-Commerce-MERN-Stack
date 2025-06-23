// import express from 'express';
// import { User, Category, Product, Order, OrderItem } from '../models/models.js';
// import { authenticate, isAdmin } from '../middleware/auth.js';

// const router = express.Router();

// // Apply authentication and admin middleware to all routes
// router.use(authenticate);
// router.use(isAdmin);

// // Get dashboard stats
// router.get('/stats', async (req, res) => {
//   try {
//     const [totalUsers, totalProducts, totalOrders, totalRevenue, recentOrders, topProducts] = await Promise.all([
//       User.countDocuments({ role: 'user' }),
//       Product.countDocuments({ status: 'active' }),
//       Order.countDocuments(),
//       Order.aggregate([
//         { $match: { payment_status: 'completed' } },
//         { $group: { _id: null, revenue: { $sum: '$total' } } }
//       ]).then(result => result[0]?.revenue || 0),
//       Order.find()
//         .populate('user_id', 'name')
//         .sort({ created_at: -1 })
//         .limit(5)
//         .lean(),
//       OrderItem.aggregate([
//         {
//           $group: {
//             _id: '$product_id',
//             sold: { $sum: '$quantity' }
//           }
//         },
//         {
//           $lookup: {
//             from: 'products',
//             localField: '_id',
//             foreignField: '_id',
//             as: 'product'
//           }
//         },
//         { $unwind: '$product' },
//         { $project: { name: '$product.name', sold: 1 } },
//         { $sort: { sold: -1 } },
//         { $limit: 5 }
//       ])
//     ]);

//     res.json({
//       success: true,
//       data: { stats: { totalUsers, totalProducts, totalOrders, totalRevenue }, recentOrders, topProducts }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch stats',
//       error: error.message
//     });
//   }
// });

// // Product management
// router.get('/products', async (req, res) => {
//   try {
//     const products = await Product.find()
//       .populate('category_id', 'name')
//       .sort({ created_at: -1 })
//       .lean();

//     res.json({
//       success: true,
//       data: { products }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch products',
//       error: error.message
//     });
//   }
// });

// router.post('/products', async (req, res) => {
//   try {
//     const { name, description, price, categoryId, stock, images, featured } = req.body;

//     const product = new Product({
//       name,
//       description,
//       price,
//       category_id: categoryId,
//       stock,
//       images: images || [],
//       featured: !!featured
//     });

//     await product.save();

//     res.status(201).json({
//       success: true,
//       message: 'Product created successfully',
//       data: { productId: product._id }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Failed to create product',
//       error: error.message
//     });
//   }
// });

// router.put('/products/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, description, price, categoryId, stock, images, featured, status } = req.body;

//     await Product.findByIdAndUpdate(id, {
//       name,
//       description,
//       price,
//       category_id: categoryId,
//       stock,
//       images: images || [],
//       featured: !!featured,
//       status,
//       updated_at: new Date()
//     });

//     res.json({
//       success: true,
//       message: 'Product updated successfully'
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update product',
//       error: error.message
//     });
//   }
// });

// router.delete('/products/:id', async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Soft delete by updating status
//     await Product.findByIdAndUpdate(id, { status: 'deleted', updated_at: new Date() });

//     res.json({
//       success: true,
//       message: 'Product deleted successfully'
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Failed to delete product',
//       error: error.message
//     });
//   }
// });

// // Category management
// router.post('/categories', async (req, res) => {
//   try {
//     const { name, description, image } = req.body;

//     const category = new Category({ name, description, image });
//     await category.save();

//     res.status(201).json({
//       success: true,
//       message: 'Category created successfully',
//       data: { categoryId: category._id }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Failed to create category',
//       error: error.message
//     });
//   }
// });

// // Order management
// router.get('/orders', async (req, res) => {
//   try {
//     const orders = await Order.find()
//       .populate('user_id', 'name email')
//       .sort({ created_at: -1 })
//       .lean();

//     const ordersWithItems = await Promise.all(orders.map(async (order) => {
//       const items = await OrderItem.find({ order_id: order._id })
//         .populate('product_id', 'name')
//         .lean();
//       return { ...order, items };
//     }));

//     res.json({
//       success: true,
//       data: { orders: ordersWithItems }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch orders',
//       error: error.message
//     });
//   }
// });

// router.put('/orders/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status, paymentStatus } = req.body;

//     await Order.findByIdAndUpdate(id, {
//       status,
//       payment_status: paymentStatus,
//       updated_at: new Date()
//     });

//     res.json({
//       success: true,
//       message: 'Order updated successfully'
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update order',
//       error: error.message
//     });
//   }
// });

// // User management
// router.get('/users', async (req, res) => {
//   try {
//     const users = await User.find()
//       .select('name email role created_at')
//       .sort({ created_at: -1 })
//       .lean();

//     res.json({
//       success: true,
//       data: { users }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch users',
//       error: error.message
//     });
//   }
// });

// export default router;


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
      User.countDocuments({ role: 'user', status: { $ne: 'deleted' } }), // Exclude deleted users
      Product.countDocuments({ status: 'active' }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { payment_status: 'completed' } },
        { $group: { _id: null, revenue: { $sum: '$total' } } },
      ]).then((result) => result[0]?.revenue || 0),
      Order.find()
        .populate('user_id', 'name')
        .sort({ created_at: -1 })
        .limit(5)
        .lean(),
      OrderItem.aggregate([
        { $group: { _id: '$product_id', sold: { $sum: '$quantity' }  } },
        { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
        { $unwind: '$product' },
        { $match: { 'product.status': 'active' } }, // Only include active products
        { $project: { name: '$product.name', stock: '$product.stock', price: '$product.price', sold: 1 } },
        { $sort: { sold: -1 } },
        { $limit: 5 },
      ]),
    ]);

    res.json({
      success: true,
      data: { stats: { totalUsers, totalProducts, totalOrders, totalRevenue }, recentOrders, topProducts },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
      error: error.message,
    });
  }
});

// Fetch all users with pagination and search
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const search = req.query.search || '';

    const query = {
      status: { $ne: 'deleted' }, // Exclude deleted users
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
    };

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('name email role created_at updated_at')
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          totalPages: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
});

// Update user role
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.role = role;
    user.updated_at = new Date();
    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: {
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          created_at: updatedUser.created_at,
          updated_at: updatedUser.updated_at,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: error.message,
    });
  }
});

// Delete user (soft delete)
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.status = 'deleted';
    user.updated_at = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message,
    });
  }
});

// Fetch all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ created_at: -1 }).lean();

    res.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message,
    });
  }
});

// Create category
router.post('/categories', async (req, res) => {
  try {
    const { name, description, image } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists',
      });
    }

    const category = new Category({ name, description, image });
    const createdCategory = await category.save();

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { categoryId: createdCategory._id },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message,
    });
  }
});

// Update category
router.put('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    if (name && name !== category.name) {
      const categoryExists = await Category.findOne({ name });
      if (categoryExists) {
        return res.status(400).json({
          success: false,
          message: 'Category name already exists',
        });
      }
    }

    category.name = name || category.name;
    category.description = description || category.description;
    category.image = image || category.image;
    const updatedCategory = await category.save();

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: { category: updatedCategory },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message,
    });
  }
});

// Delete category
router.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    const products = await Product.find({ category_id: id });
    if (products.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with associated products',
      });
    }

    await category.remove();

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message,
    });
  }
});

// Fetch all orders with pagination, search, and status filtering
router.get('/orders', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const search = req.query.search || '';
    const status = req.query.status || '';

    const query = {};
    if (search) {
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
        status: { $ne: 'deleted' },
      }).select('_id');
      query.user_id = { $in: users.map((u) => u._id) };
    }
    if (status) {
      query.status = status;
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user_id', 'name email')
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItem.find({ order_id: order._id })
          .populate('product_id', 'name')
          .lean();
        return { ...order, items };
      })
    );

    res.json({
      success: true,
      data: {
        orders: ordersWithItems,
        pagination: {
          page,
          totalPages: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message,
    });
  }
});

// Update order status
router.put('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    const validPaymentStatuses = ['pending', 'completed', 'failed'];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status',
      });
    }

    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status',
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    order.status = status || order.status;
    order.payment_status = paymentStatus || order.payment_status;
    order.updated_at = new Date();
    const updatedOrder = await order.save();

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: { order: updatedOrder },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update order',
      error: error.message,
    });
  }
});

// Fetch all products with pagination and search
router.get('/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const search = req.query.search || '';

    const query = {
      status: 'active',
      name: { $regex: search, $options: 'i' },
    };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category_id', 'name')
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          totalPages: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message,
    });
  }
});

// Create product
router.post('/products', async (req, res) => {
  try {
    const { name, description, price, categoryId, stock, images, featured, status } = req.body;

    if (!name || !price || !categoryId || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing',
      });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    const product = new Product({
      name,
      description,
      price,
      category_id: categoryId,
      stock,
      images: images || [],
featured: !!featured,
      status: status || 'active',
    });

    const createdProduct = await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { productId: createdProduct._id },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message,
    });
  }
});

// Update product
router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, categoryId, stock, images, featured, status } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      }
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category_id = categoryId || product.category_id;
    product.stock = stock !== undefined ? stock : product.stock;
    product.images = images || product.images;
    product.featured = featured !== undefined ? featured : product.featured;
    product.status = status || product.status;
    product.updated_at = new Date();

    const updatedProduct = await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product: updatedProduct },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message,
    });
  }
});

// Delete product (soft delete)
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    product.status = 'deleted';
    product.updated_at = new Date();
    await product.save();

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message,
    });
  }
});

export default router;