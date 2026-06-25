import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  notifications: [],
  unreadCount: 0,
  latestNotification: null,
  viewingNotification: null,
  isLoading: false,
  isError: false,
  message: ''
};

// Fetch notifications
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.accessToken;
      const response = await axios.get('/api/notifications', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Mark all as read
export const markNotificationsAsRead = createAsyncThunk(
  'notifications/markRead',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.accessToken;
      await axios.put('/api/notifications', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return true;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Acknowledge a single notification
export const acknowledgeNotification = createAsyncThunk(
  'notifications/acknowledge',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.accessToken;
      const response = await axios.put(`/api/notifications/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
      state.latestNotification = action.payload;
    },
    clearLatestNotification: (state) => {
      state.latestNotification = null;
    },
    setViewingNotification: (state, action) => {
      state.viewingNotification = action.payload;
    },
    clearViewingNotification: (state) => {
      state.viewingNotification = null;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.latestNotification = null;
      state.viewingNotification = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(markNotificationsAsRead.fulfilled, (state) => {
        state.unreadCount = 0;
        state.notifications.forEach((n) => {
          n.read = true;
        });
      })
      .addCase(acknowledgeNotification.fulfilled, (state, action) => {
        const index = state.notifications.findIndex((n) => n._id === action.payload._id);
        if (index !== -1) {
          if (!state.notifications[index].read) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
          state.notifications[index] = action.payload;
        }
        // Sync viewing notification state if currently viewing it
        if (state.viewingNotification?._id === action.payload._id) {
          state.viewingNotification = action.payload;
        }
      });
  }
});

export const {
  addNotification,
  clearLatestNotification,
  setViewingNotification,
  clearViewingNotification,
  clearNotifications
} = notificationSlice.actions;
export default notificationSlice.reducer;
