import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/deliveries';

// Helper to configure headers with JWT
const getAuthHeaders = (getState) => {
  const token = getState().auth.accessToken;
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

const initialState = {
  deliveries: [],
  currentDelivery: null,
  isLoading: false,
  isError: false,
  message: ''
};

// Fetch all deliveries
export const fetchDeliveries = createAsyncThunk(
  'deliveries/fetchAll',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(API_URL, getAuthHeaders(thunkAPI.getState));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Fetch single delivery by ID
export const fetchDeliveryById = createAsyncThunk(
  'deliveries/fetchOne',
  async (id, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`, getAuthHeaders(thunkAPI.getState));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create new delivery
export const createDelivery = createAsyncThunk(
  'deliveries/create',
  async (deliveryData, thunkAPI) => {
    try {
      const response = await axios.post(API_URL, deliveryData, getAuthHeaders(thunkAPI.getState));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Assign driver to delivery
export const assignDriverToDelivery = createAsyncThunk(
  'deliveries/assignDriver',
  async ({ deliveryId, driverId }, thunkAPI) => {
    try {
      const response = await axios.post(
        `${API_URL}/${deliveryId}/assign`,
        { driverId },
        getAuthHeaders(thunkAPI.getState)
      );
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update delivery status
export const updateDeliveryStatus = createAsyncThunk(
  'deliveries/updateStatus',
  async ({ deliveryId, status, comment, cancellationReason, rejectionReason }, thunkAPI) => {
    try {
      const response = await axios.put(
        `${API_URL}/${deliveryId}/status`,
        { status, comment, cancellationReason, rejectionReason },
        getAuthHeaders(thunkAPI.getState)
      );
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Review rejection request by admin
export const reviewRejectionRequest = createAsyncThunk(
  'deliveries/reviewRejection',
  async ({ deliveryId, action, adminComment }, thunkAPI) => {
    try {
      const response = await axios.put(
        `/api/deliveries/${deliveryId}/rejection-review`,
        { action, adminComment },
        getAuthHeaders(thunkAPI.getState)
      );
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete delivery
export const deleteDelivery = createAsyncThunk(
  'deliveries/delete',
  async (id, thunkAPI) => {
    try {
      await axios.delete(`${API_URL}/${id}`, getAuthHeaders(thunkAPI.getState));
      return id;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deliverySlice = createSlice({
  name: 'deliveries',
  initialState,
  reducers: {
    resetDeliveryState: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    },
    updateDeliveryInRealtime: (state, action) => {
      const index = state.deliveries.findIndex((d) => d._id === action.payload._id);
      if (index !== -1) {
        state.deliveries[index] = action.payload;
      } else {
        state.deliveries.unshift(action.payload);
      }
      if (state.currentDelivery?._id === action.payload._id) {
        state.currentDelivery = action.payload;
      }
    },
    removeDeletedDelivery: (state, action) => {
      state.deliveries = state.deliveries.filter((d) => d._id !== action.payload);
      if (state.currentDelivery?._id === action.payload) {
        state.currentDelivery = null;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchDeliveries.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDeliveries.fulfilled, (state, action) => {
        state.isLoading = false;
        state.deliveries = action.payload;
      })
      .addCase(fetchDeliveries.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Fetch One
      .addCase(fetchDeliveryById.fulfilled, (state, action) => {
        state.currentDelivery = action.payload;
      })
      // Create
      .addCase(createDelivery.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createDelivery.fulfilled, (state, action) => {
        state.isLoading = false;
        state.deliveries.unshift(action.payload);
      })
      .addCase(createDelivery.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Assign Driver
      .addCase(assignDriverToDelivery.fulfilled, (state, action) => {
        const index = state.deliveries.findIndex((d) => d._id === action.payload._id);
        if (index !== -1) {
          state.deliveries[index] = action.payload;
        }
        if (state.currentDelivery?._id === action.payload._id) {
          state.currentDelivery = action.payload;
        }
      })
      // Update Status
      .addCase(updateDeliveryStatus.fulfilled, (state, action) => {
        const index = state.deliveries.findIndex((d) => d._id === action.payload._id);
        if (index !== -1) {
          state.deliveries[index] = action.payload;
        }
        if (state.currentDelivery?._id === action.payload._id) {
          state.currentDelivery = action.payload;
        }
      })
      // Review Rejection Request
      .addCase(reviewRejectionRequest.fulfilled, (state, action) => {
        const index = state.deliveries.findIndex((d) => d._id === action.payload._id);
        if (index !== -1) {
          state.deliveries[index] = action.payload;
        }
        if (state.currentDelivery?._id === action.payload._id) {
          state.currentDelivery = action.payload;
        }
      })
      // Delete
      .addCase(deleteDelivery.fulfilled, (state, action) => {
        state.deliveries = state.deliveries.filter((d) => d._id !== action.payload);
      });
  }
});

export const { resetDeliveryState, updateDeliveryInRealtime, removeDeletedDelivery } = deliverySlice.actions;
export default deliverySlice.reducer;
