import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/cart');
      return response.data.data.cartItems;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      await api.post('/users/cart', { productId, quantity });
      return { productId, quantity };
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      await api.put(`/users/cart/${productId}`, { quantity });
      return { productId, quantity };
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (productId, { rejectWithValue }) => {
    try {
      await api.delete(`/users/cart/${productId}`);
      return productId;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    isLoading: false,
    error: null,
    total: 0,
    itemCount: 0
  },
  reducers: {
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.itemCount = 0;
    },
    calculateTotals: (state) => {
      state.total = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      state.itemCount = state.items.reduce((count, item) => count + item.quantity, 0);
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        cartSlice.caseReducers.calculateTotals(state);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(addToCart.fulfilled, (state) => {
        // Refetch cart after adding item
      })
      .addCase(updateCartItem.fulfilled, (state) => {
        // Refetch cart after updating item
      })
      .addCase(removeFromCart.fulfilled, (state) => {
        // Refetch cart after removing item
      });
  }
});

export const { clearCart, calculateTotals, clearError } = cartSlice.actions;
export default cartSlice.reducer;