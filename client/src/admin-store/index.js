import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import adminSlice from './slices/adminSlice';
import productsSlice from './slices/productsSlice';
import categoriesSlice from './slices/categoriesSlice';
import usersSlice from './slices/usersSlice';
import ordersSlice from './slices/ordersSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    admin: adminSlice,
    products: productsSlice,
    categories: categoriesSlice,
    users: usersSlice,
    orders: ordersSlice,
  },
});