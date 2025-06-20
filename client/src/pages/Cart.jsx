import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { fetchCart, updateCartItem, removeFromCart } from '../store/slices/cartSlice';
import toast from 'react-hot-toast';

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, total, itemCount, isLoading } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(fetchCart());
  }, [dispatch, isAuthenticated, navigate]);

  const handleUpdateQuantity = async (productId, newQuantity) => {
    try {
      await dispatch(updateCartItem({ productId, quantity: newQuantity })).unwrap();
      dispatch(fetchCart());
    } catch (error) {
      toast.error(error || 'Failed to update cart');
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await dispatch(removeFromCart(productId)).unwrap();
      dispatch(fetchCart());
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error(error || 'Failed to remove item');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
          <Link 
            to="/products" 
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700  transition-colors inline-flex items-center space-x-2"
          >
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-4">
                <img
                  src={item.images?.[0] || 'https://images.pexels.com/photos/3683041/pexels-photo-3683041.jpeg'}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-gray-600">{formatPrice(item.price)}</p>
                  <p className="text-sm text-gray-500">
                    {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2 font-medium">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item.product_id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Items ({itemCount})</span>
                <span className="font-medium">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {total >= 50 ? 'Free' : formatPrice(9.99)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">{formatPrice(total * 0.08)}</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatPrice(total + (total >= 50 ? 0 : 9.99) + (total * 0.08))}</span>
              </div>
            </div>

            {total < 50 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-blue-700">
                  Add {formatPrice(50 - total)} more to get free shipping!
                </p>
              </div>
            )}

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Proceed to Checkout
            </button>

            <Link
              to="/products"
              className="block text-center text-blue-600 hover:text-blue-700 mt-4"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;