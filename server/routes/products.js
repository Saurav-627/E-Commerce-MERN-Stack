import express from 'express';
import { Product, Category } from '../models/models.js';

const router = express.Router();

// Get all products with pagination and filters
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      search, 
      minPrice, 
      maxPrice, 
      featured,
      sort = 'created_at DESC'
    } = req.query;

    const skip = (page - 1) * limit;
    const query = { status: 'active' };
    const sortOptions = {};

    // Apply filters
    if (category) {
      query.category_id = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (minPrice) {
      query.price = { ...query.price, $gte: parseFloat(minPrice) };
    }

    if (maxPrice) {
      query.price = { ...query.price, $lte: parseFloat(maxPrice) };
    }

    if (featured === 'true') {
      query.featured = true;
    }

    // Add sorting
    const validSorts = {
      'created_at DESC': { created_at: -1 },
      'created_at ASC': { created_at: 1 },
      'price ASC': { price: 1 },
      'price DESC': { price: -1 },
      'name ASC': { name: 1 }
    };
    const sortClause = validSorts[sort] || { created_at: -1 };

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category_id', 'name')
        .sort(sortClause)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Product.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalProducts: total,
          hasMore: parseInt(page) * parseInt(limit) < total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findOne({ _id: id, status: 'active' })
      .populate('category_id', 'name')
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
});

// Get categories
router.get('/categories/all', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();
    
    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});

export default router;