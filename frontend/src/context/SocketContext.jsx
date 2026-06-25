import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { addNotification } from '../store/slices/notificationSlice';
import { updateDeliveryInRealtime, removeDeletedDelivery } from '../store/slices/deliverySlice';
import { updateDriverStatusInRealtime } from '../store/slices/driverSlice';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { accessToken } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!accessToken) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Connect to websocket gateway
    // In production, we point to root window location (proxy handled by Nginx)
    const newSocket = io(window.location.origin, {
      auth: {
        token: accessToken
      },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Socket.io connected successfully:', newSocket.id);
    });

    // Real-time events registry
    newSocket.on('notification', (notification) => {
      dispatch(addNotification(notification));
    });

    newSocket.on('delivery_updated', (delivery) => {
      dispatch(updateDeliveryInRealtime(delivery));
    });

    newSocket.on('delivery_deleted', (payload) => {
      dispatch(removeDeletedDelivery(payload.id));
    });

    newSocket.on('driver_status_change', (payload) => {
      dispatch(updateDriverStatusInRealtime(payload));
    });

    newSocket.on('disconnect', () => {
      console.log('Socket.io disconnected');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [accessToken, dispatch]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
