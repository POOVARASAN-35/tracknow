import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/auth';

// Helper to get initial state
const getInitialUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

const initialState = {
  user: getInitialUser(),
  accessToken: localStorage.getItem('accessToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  isLoading: false,
  isError: false,
  message: '',
  isSessionTimedOut: false,
  lastRole: localStorage.getItem('lastRole') || null,
  isLogoutConfirmOpen: false
};

// Register user
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Login user
export const loginUser = createAsyncThunk(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/login`, userData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Login with Google
export const loginWithGoogle = createAsyncThunk(
  'auth/google',
  async (googlePayload, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/google`, googlePayload);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Logout user
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.accessToken;
      if (token) {
        await axios.post(
          `${API_URL}/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      }
    } catch (error) {
      console.warn('Backend logout error:', error.message);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }
);

// Refresh Token Thunk
export const rotateTokens = createAsyncThunk(
  'auth/refresh',
  async (tokenPayload, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/refresh`, { refreshToken: tokenPayload });
      return response.data;
    } catch (error) {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return thunkAPI.rejectWithValue('Session expired');
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
    reducers: {
      reset: (state) => {
        state.isLoading = false;
        state.isError = false;
        state.message = '';
      },
      updateAccessToken: (state, action) => {
        state.accessToken = action.payload;
        localStorage.setItem('accessToken', action.payload);
      },
      updateUser: (state, action) => {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('user', JSON.stringify(state.user));
      },
      setSessionTimedOut: (state, action) => {
        state.isSessionTimedOut = action.payload;
        if (action.payload) {
          state.user = null;
          state.accessToken = null;
          state.refreshToken = null;
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      },
      setLogoutConfirmOpen: (state, action) => {
        state.isLogoutConfirmOpen = action.payload;
      }
    },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isSessionTimedOut = false;
        state.lastRole = action.payload.user?.role || null;
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
        if (action.payload.user?.role) {
          localStorage.setItem('lastRole', action.payload.user.role);
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isSessionTimedOut = false;
        state.lastRole = action.payload.user?.role || null;
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
        if (action.payload.user?.role) {
          localStorage.setItem('lastRole', action.payload.user.role);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      // Google Login
      .addCase(loginWithGoogle.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isSessionTimedOut = false;
        state.lastRole = action.payload.user?.role || null;
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
        if (action.payload.user?.role) {
          localStorage.setItem('lastRole', action.payload.user.role);
        }
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
      })
      // Token Rotation
      .addCase(rotateTokens.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      })
      .addCase(rotateTokens.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
      })
      .addCase('drivers/updateMyProfile/fulfilled', (state, action) => {
        if (action.payload && action.payload.user) {
          const updatedUser = {
            id: action.payload.user._id,
            name: action.payload.user.name,
            email: action.payload.user.email,
            role: action.payload.user.role,
            profileImage: action.payload.user.profileImage,
            phone: action.payload.user.phone
          };
          state.user = updatedUser;
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      });
  }
});

export const { reset, updateAccessToken, updateUser, setSessionTimedOut, setLogoutConfirmOpen } = authSlice.actions;
export default authSlice.reducer;
