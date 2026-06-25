import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const getAuthHeaders = (thunkAPI) => {
  const token = thunkAPI.getState().auth.accessToken;
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

const initialState = {
  orders: [],
  isLoading: false,
  isError: false,
  message: ''
};

// Place order
export const placeOrder = createAsyncThunk(
  'orders/placeOrder',
  async (orderPayload, thunkAPI) => {
    try {
      const response = await axios.post('/api/orders', orderPayload, getAuthHeaders(thunkAPI));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Fetch orders list
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get('/api/orders', getAuthHeaders(thunkAPI));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Submit review rating
export const submitReview = createAsyncThunk(
  'orders/submitReview',
  async (reviewPayload, thunkAPI) => {
    try {
      const response = await axios.post('/api/reviews', reviewPayload, getAuthHeaders(thunkAPI));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    resetOrderState: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    }
  },
  extraReducers: (builder) => {
    builder
      // Place Order
      .addCase(placeOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = [action.payload, ...state.orders];
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Submit Review
      .addCase(submitReview.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(submitReview.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;
