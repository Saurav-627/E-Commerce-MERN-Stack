import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingCart, Heart, Star, Plus, Minus, ArrowLeft } from 'lucide-react';
import { fetchProductById, clearCurrentProduct } from '../store/slices/productSlice';
import { addToCart, fetchCart } from '../store/slices/cartSlice';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentProduct, isLoading } = useSelector((state) => state.products);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (currentProduct?.images?.length > 0) {
      setSelectedImage(0);
    }
  }, [currentProduct]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to cart');
      navigate('/login');
      return;
    }

    try {
      await dispatch(addToCart({ productId: currentProduct.id, quantity })).unwrap();
      await dispatch(fetchCart());
      toast.success('Added to cart!');
    } catch (error) {
      toast.error(error || 'Failed to add to cart');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="bg-gray-300 rounded-lg h-96"></div>
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-300 rounded h-20"></div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-8 bg-gray-300 rounded"></div>
              <div className="h-6 bg-gray-300 rounded w-3/4"></div>
              <div className="h-24 bg-gray-300 rounded"></div>
              <div className="h-12 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Product not found</p>
          <button
            onClick={() => navigate('/products')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={currentProduct.images?.[selectedImage] || 'https://images.pexels.com/photos/3683041/pexels-photo-3683041.jpeg'}
              alt={currentProduct.name}
              className="w-full h-full object-cover"
            />
          </div>
          {currentProduct.images?.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {currentProduct.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-blue-600' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${currentProduct.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm text-blue-600 font-medium">{currentProduct.category_name}</span>
              {currentProduct.featured && (
                <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                  Featured
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{currentProduct.name}</h1>
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-gray-600 ml-2">(4.5) · 127 reviews</span>
              </div>
            </div>
          </div>

          <div className="text-3xl font-bold text-gray-900">
            {formatPrice(currentProduct.price)}
          </div>

          <p className="text-gray-600 leading-relaxed">
            {currentProduct.description}
          </p>

          {/* Stock Status */}
          <div className="flex items-center space-x-2">
            {currentProduct.stock > 0 ? (
              <>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-green-600 font-medium">In Stock ({currentProduct.stock} available)</span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-red-600 font-medium">Out of Stock</span>
              </>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 font-medium">Quantity:</span>
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 hover:bg-gray-100 transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-4 py-2 font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(currentProduct.stock, quantity + 1))}
                disabled={quantity >= currentProduct.stock}
                className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={handleAddToCart}
              disabled={currentProduct.stock === 0}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Add to Cart</span>
            </button>
            <button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
              <Heart className="h-5 w-5" />
            </button>
          </div>

          {/* Product Features */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Features</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• High-quality materials and construction</li>
              <li>• 30-day money-back guarantee</li>
              <li>• Free shipping on orders over $50</li>
              <li>• Expert customer support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;