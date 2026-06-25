import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/drivers';

const getAuthHeaders = (getState) => {
  const token = getState().auth.accessToken;
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

const initialState = {
  drivers: [],
  profile: null,
  isLoading: false,
  isError: false,
  message: ''
};

// Fetch all drivers
export const fetchDrivers = createAsyncThunk(
  'drivers/fetchAll',
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

// Fetch driver profile (self)
export const fetchDriverProfile = createAsyncThunk(
  'drivers/fetchProfile',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/profile`, getAuthHeaders(thunkAPI.getState));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Add driver
export const addDriver = createAsyncThunk(
  'drivers/add',
  async (driverData, thunkAPI) => {
    try {
      const response = await axios.post(API_URL, driverData, getAuthHeaders(thunkAPI.getState));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Edit driver profile
export const updateDriver = createAsyncThunk(
  'drivers/update',
  async ({ id, driverData }, thunkAPI) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, driverData, getAuthHeaders(thunkAPI.getState));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete driver
export const deleteDriver = createAsyncThunk(
  'drivers/delete',
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

// Update driver profile (self)
export const updateMyProfile = createAsyncThunk(
  'drivers/updateMyProfile',
  async (profileData, thunkAPI) => {
    try {
      const response = await axios.put(`${API_URL}/profile`, profileData, getAuthHeaders(thunkAPI.getState));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Upload document (self)
export const uploadMyDocuments = createAsyncThunk(
  'drivers/uploadMyDocuments',
  async ({ docName, docUrl }, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/profile/documents`, { docName, docUrl }, getAuthHeaders(thunkAPI.getState));
      return response.data.documents;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const driverSlice = createSlice({
  name: 'drivers',
  initialState,
  reducers: {
    resetDriverState: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    },
    updateDriverStatusInRealtime: (state, action) => {
      const index = state.drivers.findIndex((d) => d.user?._id === action.payload.driverId);
      if (index !== -1) {
        state.drivers[index].status = action.payload.status;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchDrivers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDrivers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.drivers = action.payload;
      })
      .addCase(fetchDrivers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Fetch Profile
      .addCase(fetchDriverProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      })
      // Add
      .addCase(addDriver.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addDriver.fulfilled, (state, action) => {
        state.isLoading = false;
        state.drivers.unshift(action.payload);
      })
      .addCase(addDriver.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Edit
      .addCase(updateDriver.fulfilled, (state, action) => {
        const index = state.drivers.findIndex((d) => d._id === action.payload._id);
        if (index !== -1) {
          state.drivers[index] = action.payload;
        }
      })
      // Delete
      .addCase(deleteDriver.fulfilled, (state, action) => {
        state.drivers = state.drivers.filter((d) => d._id !== action.payload);
      })
      // Update My Profile (self)
      .addCase(updateMyProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(updateMyProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Upload My Documents (self)
      .addCase(uploadMyDocuments.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.documents = action.payload;
        }
      });
  }
});

export const { resetDriverState, updateDriverStatusInRealtime } = driverSlice.actions;
export default driverSlice.reducer;
