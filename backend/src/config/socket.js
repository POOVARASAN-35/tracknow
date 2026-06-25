const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io = null;
const connectedUsers = new Map(); // userId -> socketId

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'your_jwt_access_secret_key_change_me_in_prod');
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      console.error('Socket authentication error:', err.message);
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`Socket connected: ${socket.id} (User: ${user.name}, Role: ${user.role})`);
    
    // Register connected user
    connectedUsers.set(user._id.toString(), socket.id);
    socket.join(user.role); // Join role specific room
    if (user.role === 'superadmin') {
      socket.join('admin');
    }

    // Handle tracking page join room (for customers)
    socket.on('join_delivery_room', (deliveryId) => {
      socket.join(`delivery:${deliveryId}`);
      console.log(`Socket ${socket.id} joined room delivery:${deliveryId}`);
    });

    // Handle tracking page leave room
    socket.on('leave_delivery_room', (deliveryId) => {
      socket.leave(`delivery:${deliveryId}`);
      console.log(`Socket ${socket.id} left room delivery:${deliveryId}`);
    });

    // Handle live coordinates stream via WebSockets
    socket.on('driver:location_update', async (data) => {
      // data: { latitude, longitude, speed, deliveryId }
      try {
        if (user.role === 'driver') {
          const { processLocationUpdate } = require('../services/trackingService');
          await processLocationUpdate(user._id.toString(), user.name, data);
        }
      } catch (err) {
        console.error('Socket location update processing error:', err.message);
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.log(`Socket disconnected: ${socket.id}`);
      connectedUsers.delete(user._id.toString());

      // If driver goes offline, update status in DB and broadcast to admins
      if (user.role === 'driver') {
        try {
          const Driver = require('../models/Driver');
          const Notification = require('../models/Notification');
          
          await Driver.findOneAndUpdate({ user: user._id }, { status: 'offline' });
          
          const notif = await Notification.create({
            recipient: null,
            title: 'Driver Offline',
            message: `Driver ${user.name} is now offline.`,
            type: 'driver_offline'
          });

          broadcastToRole('admin', 'notification', notif);
          broadcastToRole('admin', 'driver_status_change', { driverId: user._id, status: 'offline' });
        } catch (err) {
          console.error('Error handling offline driver socket disconnect:', err.message);
        }
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

const sendToUser = (userId, event, data) => {
  if (!io) return;
  const socketId = connectedUsers.get(userId.toString());
  if (socketId) {
    io.to(socketId).emit(event, data);
  }
};

const broadcastToRole = (role, event, data) => {
  if (!io) return;
  io.to(role).emit(event, data);
};

const sendToDeliveryRoom = (deliveryId, event, data) => {
  if (!io) return;
  io.to(`delivery:${deliveryId}`).emit(event, data);
};

module.exports = {
  initSocket,
  getIO,
  sendToUser,
  broadcastToRole,
  sendToDeliveryRoom,
  connectedUsers
};
