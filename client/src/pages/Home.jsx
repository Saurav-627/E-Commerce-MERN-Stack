import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowRight, Shield, Truck, CreditCard, Star } from "lucide-react";
import { fetchProducts, fetchCategories } from "../store/slices/productSlice";
import ProductCard from "../components/Products/ProductCard";

const Home = () => {
  const dispatch = useDispatch();
  const { products, categories, isLoading } = useSelector(
    (state) => state.products
  );

  useEffect(() => {
    dispatch(fetchProducts({ featured: true, limit: 8 }));
    dispatch(fetchCategories());
  }, [dispatch]);

  const features = [
    {
      icon: Shield,
      title: "Secure Shopping",
      description: "Your data is protected with bank-level security",
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Free shipping on orders over $50",
    },
    {
      icon: CreditCard,
      title: "Easy Payments",
      description: "Multiple payment options available",
    },
    {
      icon: Star,
      title: "Quality Products",
      description: "Only the best products from trusted sellers",
    },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Discover Amazing Products at
                <span className="text-yellow-400"> Unbeatable Prices</span>
              </h1>
              <p className="text-xl text-blue-100 max-w-lg">
                Shop from thousands of products across multiple categories.
                Quality guaranteed, fast delivery, and exceptional customer
                service.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/products"
                  className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-yellow-300 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/categories"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors flex items-center justify-center"
                >
                  Browse Categories
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <img
                src="https://images.pexels.com/photos/3965548/pexels-photo-3965548.jpeg"
                alt="Shopping"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose ShopHub?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We're committed to providing the best shopping experience with these
            key benefits
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-lg bg-gray-50 hover:bg-white hover:shadow-lg transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-4">
                <feature.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Featured Products
            </h2>
            <p className="text-gray-600">
              Discover our handpicked selection of premium products
            </p>
          </div>
          <Link
            to="/products"
            className="text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className="bg-gray-200 animate-pulse rounded-lg h-96"
              ></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product) => {
              return <ProductCard key={product.id} product={product} />;
            })}
          </div>
        )}
      </section>

      {/* Categories Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find exactly what you're looking for in our carefully curated
              categories
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.slice(0, 5).map((category) => (
              <Link
                key={category._id}
                to={`/products?category=${category.id}`}
                className="group text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                <img
                  src={
                    category.image ||
                    "https://images.pexels.com/photos/3683041/pexels-photo-3683041.jpeg"
                  }
                  alt={category.name}
                  className="w-16 h-16 mx-auto mb-4 rounded-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Stay Updated with Our Latest Offers
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Subscribe to our newsletter and be the first to know about new
            products, exclusive deals, and special promotions.
          </p>
          <div className="flex flex-col sm:flex-row max-w-md mx-auto space-y-4 sm:space-y-0 sm:space-x-4">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <button className="bg-yellow-400 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
