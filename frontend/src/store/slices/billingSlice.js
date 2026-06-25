import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/billing';

export const fetchBillingSummary = createAsyncThunk(
  'billing/fetchSummary',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: { Authorization: `Bearer ${auth.accessToken}` }
      };
      const response = await axios.get(`${API_URL}/summary`, config);
      return response.data.summary;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchInvoices = createAsyncThunk(
  'billing/fetchInvoices',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: { Authorization: `Bearer ${auth.accessToken}` }
      };
      const response = await axios.get(`${API_URL}/invoices`, config);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  'billing/fetchTransactions',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: { Authorization: `Bearer ${auth.accessToken}` }
      };
      const response = await axios.get(`${API_URL}/transactions`, config);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchRefunds = createAsyncThunk(
  'billing/fetchRefunds',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: { Authorization: `Bearer ${auth.accessToken}` }
      };
      const response = await axios.get(`${API_URL}/refunds`, config);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchPaymentMethods = createAsyncThunk(
  'billing/fetchPaymentMethods',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: { Authorization: `Bearer ${auth.accessToken}` }
      };
      const response = await axios.get(`${API_URL}/payment-methods`, config);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const addPaymentMethod = createAsyncThunk(
  'billing/addPaymentMethod',
  async (payload, { getState, rejectWithValue, dispatch }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: { Authorization: `Bearer ${auth.accessToken}` }
      };
      const response = await axios.post(`${API_URL}/payment-methods`, payload, config);
      dispatch(fetchPaymentMethods());
      dispatch(fetchBillingSummary());
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deletePaymentMethod = createAsyncThunk(
  'billing/deletePaymentMethod',
  async (id, { getState, rejectWithValue, dispatch }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: { Authorization: `Bearer ${auth.accessToken}` }
      };
      await axios.delete(`${API_URL}/payment-methods/${id}`, config);
      dispatch(fetchPaymentMethods());
      dispatch(fetchBillingSummary());
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const setDefaultPaymentMethod = createAsyncThunk(
  'billing/setDefaultPaymentMethod',
  async (id, { getState, rejectWithValue, dispatch }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: { Authorization: `Bearer ${auth.accessToken}` }
      };
      const response = await axios.put(`${API_URL}/payment-methods/${id}/default`, {}, config);
      dispatch(fetchPaymentMethods());
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchWalletInfo = createAsyncThunk(
  'billing/fetchWalletInfo',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: { Authorization: `Bearer ${auth.accessToken}` }
      };
      const response = await axios.get(`${API_URL}/wallet`, config);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const raiseBillingIssue = createAsyncThunk(
  'billing/raiseIssue',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: { Authorization: `Bearer ${auth.accessToken}` }
      };
      const response = await axios.post(`${API_URL}/raise-issue`, payload, config);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const initialState = {
  summary: null,
  invoices: [],
  transactions: [],
  refunds: [],
  paymentMethods: [],
  wallet: null,
  loading: false,
  error: null
};

const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBillingSummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBillingSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
        state.error = null;
      })
      .addCase(fetchBillingSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.invoices = action.payload;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload;
      })
      .addCase(fetchRefunds.fulfilled, (state, action) => {
        state.refunds = action.payload;
      })
      .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
        state.paymentMethods = action.payload;
      })
      .addCase(fetchWalletInfo.fulfilled, (state, action) => {
        state.wallet = action.payload;
      });
  }
});

export default billingSlice.reducer;
