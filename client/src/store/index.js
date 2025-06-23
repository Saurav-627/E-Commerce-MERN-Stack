import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import productSlice from './slices/productSlice';
import cartSlice from './slices/cartSlice';
import orderSlice from './slices/orderSlice';
import adminSlice from './slices/adminSlice';
import categoriesSlice from './slices/categoriesSlice';


export const store = configureStore({
  reducer: {
    auth: authSlice,
    admin: adminSlice,
    products: productSlice,
    categories: categoriesSlice,
    cart: cartSlice,
    orders: orderSlice,
  },
});
