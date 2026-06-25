import axios from 'axios';
import { setSessionTimedOut } from './slices/authSlice';

/**
 * Configure global Axios interceptors to intercept responses.
 * Specifically handles 401 Unauthorized to trigger global session timeout.
 * 
 * @param {object} store - Redux Store instance
 */
export const setupAxiosInterceptors = (store) => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const { response, config } = error;
      
      if (response && response.status === 401) {
        // Exclude authorization attempts (login/register/refresh) to avoid displaying timeout modal on wrong credentials
        const isAuthEndpoint = config.url && (
          config.url.includes('/api/auth/login') ||
          config.url.includes('/api/auth/register')
        );

        const state = store.getState();
        const hasUser = !!state.auth.user;

        // If the 401 is NOT from authentication endpoint and there is a user logged in, session is timed out
        if (!isAuthEndpoint && hasUser) {
          store.dispatch(setSessionTimedOut(true));
        }
      }
      return Promise.reject(error);
    }
  );
};
