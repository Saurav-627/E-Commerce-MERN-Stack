import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api  from '../../utils/api';

const initialState = {
  stats: null,
  isLoading: false,
  error: null,
};

export const fetchAdminStats = createAsyncThunk(
  'admin/fetchStats',
  async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch stats';
      });
  },
});

export default adminSlice.reducer;