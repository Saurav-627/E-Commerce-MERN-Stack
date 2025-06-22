import { User, Category, Product, Order, OrderItem, CartItem } from '../models/models.js';
import bcrypt from 'bcryptjs';

export const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await Promise.all([
      OrderItem.deleteMany({}),
      Order.deleteMany({}),
      CartItem.deleteMany({}),
      Product.deleteMany({}),
      Category.deleteMany({}),
      User.deleteMany({})
    ]);

    // Seed categories
    const categories = [
      { name: 'Electronics', description: 'Latest gadgets and electronics', image: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg' },
      { name: 'Clothing', description: 'Fashion and apparel', image: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg' },
      { name: 'Home & Garden', description: 'Home decor and garden supplies', image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg' },
      { name: 'Sports', description: 'Sports equipment and gear', image: 'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg' },
      { name: 'Books', description: 'Books and educational materials', image: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg' }
    ];

    const savedCategories = await Category.insertMany(categories);
    const categoryIds = savedCategories.map(cat => cat._id);

    // Seed products
    const products = [
      {
        name: 'Wireless Bluetooth Headphones',
        description: 'Premium quality wireless headphones with noise cancellation and 30-hour battery life.',
        price: 500.00,
        category_id: categoryIds[0],
        stock: 50,
        featured: true,
        images: [
          'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg',
          'https://images.pexels.com/photos/8000615/pexels-photo-8000615.jpeg'
        ]
      },
      {
        name: 'Smart Watch Series X',
        description: 'Advanced smartwatch with health monitoring, GPS, and water resistance.',
        price: 1800.00,
        category_id: categoryIds[0],
        stock: 30,
        featured: true,
        images: [
          'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg',
          'https://images.pexels.com/photos/1272238/pexels-photo-1272238.jpeg'
        ]
      },
      {
        name: 'Premium Cotton T-Shirt',
        description: 'Comfortable and stylish cotton t-shirt available in multiple colors.',
        price: 450.00,
        category_id: categoryIds[1],
        stock: 100,
        featured: false,
        images: [
          'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg',
          'https://images.pexels.com/photos/769749/pexels-photo-769749.jpeg'
        ]
      },
      {
        name: 'Designer Denim Jeans',
        description: 'High-quality denim jeans with modern fit and premium finishing.',
        price: 1200.00,
        category_id: categoryIds[1],
        stock: 75,
        featured: true,
        images: [
          'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg',
          'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg'
        ]
      },
      {
        name: 'Modern Table Lamp',
        description: 'Elegant table lamp with adjustable brightness and modern design.',
        price: 5000.00,
        category_id: categoryIds[2],
        stock: 40,
        featured: false,
        images: [
          'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg',
          'https://images.pexels.com/photos/2251206/pexels-photo-2251206.jpeg'
        ]
      },
      {
        name: 'Yoga Mat Pro',
        description: 'Non-slip yoga mat with extra cushioning for comfortable practice.',
        price: 5000.00,
        category_id: categoryIds[3],
        stock: 60,
        featured: false,
        images: [
          'https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg',
          'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg'
        ]
      },
      {
        name: 'Programming Fundamentals',
        description: 'Comprehensive guide to programming concepts and best practices.',
        price: 4500.00,
        category_id: categoryIds[4],
        stock: 25,
        featured: false,
        images: [
          'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg',
          'https://images.pexels.com/photos/256559/pexels-photo-256559.jpeg'
        ]
      },
      {
        name: 'Smartphone Pro Max',
        description: 'Latest flagship smartphone with advanced camera system and 5G connectivity.',
        price: 70000.00,
        category_id: categoryIds[0],
        stock: 20,
        featured: true,
        images: [
          'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg',
          'https://images.pexels.com/photos/1619779/pexels-photo-1619779.jpeg'
        ]
      }
    ];

    await Product.insertMany(products);

    // Seed users
    const adminPassword = await bcrypt.hash('admin123', 12);
    const userPassword = await bcrypt.hash('user123', 12);

    await User.insertMany([
      {
        name: 'Admin User',
        email: 'admin@gmail.com',
        password: adminPassword,
        role: 'admin'
      },
      {
        name: 'User',
        email: 'user@gmail.com',
        password: userPassword,
        role: 'user'
      }
    ]);

    console.log('✅ Database seeded successfully!');
    console.log('🔑 Admin credentials: admin@gmail.com / admin123');
    console.log('👤 User credentials: user@gmail.com / user123');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};