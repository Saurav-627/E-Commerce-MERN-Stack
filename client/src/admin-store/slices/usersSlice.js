import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api  from '../../utils/api';

const initialState = {
  users: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    totalPages: 1,
    total: 0,
  },
};

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async ({ page = 1, search = '' }) => {
    const response = await api.get(`/admin/users?page=${page}&search=${search}`);
    return response.data;
  }
);

export const updateUserRole = createAsyncThunk(
  'users/updateUserRole',
  async ({ id, role }) => {
    const response = await api.put(`/admin/users/${id}`, { role });
    return response.data;
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id) => {
    await api.delete(`/admin/users/${id}`);
    return id;
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.users;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch users';
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(u => u._id !== action.payload);
      });
  },
});

export default usersSlice.reducer;