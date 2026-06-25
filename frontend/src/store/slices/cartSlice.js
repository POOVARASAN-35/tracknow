import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const getAuthHeaders = (thunkAPI) => {
  const token = thunkAPI.getState().auth.accessToken;
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

const initialState = {
  products: [],
  cart: { items: [] },
  isLoading: false,
  isError: false,
  message: ''
};

// Fetch all products
export const fetchProducts = createAsyncThunk(
  'cart/fetchProducts',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get('/api/products');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Fetch user cart
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, thunkAPI) => {
    try {
      return (await axios.get('/api/cart', getAuthHeaders(thunkAPI))).data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Add item to cart
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (productId, thunkAPI) => {
    try {
      return (await axios.post('/api/cart/add', { productId }, getAuthHeaders(thunkAPI))).data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Remove item from cart
export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (productId, thunkAPI) => {
    try {
      return (await axios.post('/api/cart/remove', { productId }, getAuthHeaders(thunkAPI))).data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Clear cart
export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, thunkAPI) => {
    try {
      return (await axios.delete('/api/cart', getAuthHeaders(thunkAPI))).data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    resetCartState: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    }
  },
  extraReducers: (builder) => {
    builder
      // Products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Fetch Cart
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      // Add to Cart
      .addCase(addToCart.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      // Remove from Cart
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      // Clear Cart
      .addCase(clearCart.fulfilled, (state, action) => {
        state.cart = action.payload || { items: [] };
      });
  }
});

export const { resetCartState } = cartSlice.actions;
export default cartSlice.reducer;
