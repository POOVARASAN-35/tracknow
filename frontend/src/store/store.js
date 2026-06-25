import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import deliveryReducer from './slices/deliverySlice';
import driverReducer from './slices/driverSlice';
import notificationReducer from './slices/notificationSlice';
import cartReducer from './slices/cartSlice';
import ordersReducer from './slices/orderSlice';
import billingReducer from './slices/billingSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    deliveries: deliveryReducer,
    drivers: driverReducer,
    notifications: notificationReducer,
    cart: cartReducer,
    orders: ordersReducer,
    billing: billingReducer
  }
});
