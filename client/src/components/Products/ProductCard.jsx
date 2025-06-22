import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { addToCart, fetchCart } from '../../store/slices/cartSlice';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    try {
      await dispatch(addToCart({ productId: product._id, quantity: 1 })).unwrap();
      await dispatch(fetchCart());
      toast.success('Added to cart!');
    } catch (error) {
      toast.error(error || 'Failed to add to cart');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NPR'
    }).format(price);
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <Link to={`/products/${product._id}`}>
        <div className="relative overflow-hidden">
          <img
            src={product.images?.[0] || 'https://images.pexels.com/photos/3683041/pexels-photo-3683041.jpeg'}
            alt={product.name}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.featured && (
            <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              Featured
            </div>
          )}
          <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100">
            <Heart className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </Link>

      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-blue-600 font-medium">{product.category_name}</span>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-gray-600">4.5</span>
          </div>
        </div>

        <Link to={`/products/${product.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.stock > 0 ? (
              <span className="text-sm text-green-600">In Stock</span>
            ) : (
              <span className="text-sm text-red-600">Out of Stock</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="bg-blue-600 text-white px-2 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;