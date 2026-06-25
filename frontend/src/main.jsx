import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import CssBaseline from '@mui/material/CssBaseline';

import App from './App.jsx';
import { store } from './store/store.js';
import { setupAxiosInterceptors } from './store/axiosSetup.js';
import { SocketProvider } from './context/SocketContext.jsx';
import './index.css';

// Initialize global axios interceptor with store reference
setupAxiosInterceptors(store);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <SocketProvider>
        <ThemeProvider>
          <CssBaseline />
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ThemeProvider>
      </SocketProvider>
    </Provider>
  </React.StrictMode>
);
