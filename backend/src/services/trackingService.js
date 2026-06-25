const Driver = require('../models/Driver');
const Delivery = require('../models/Delivery');
const TrackingLog = require('../models/TrackingLog');
const Zone = require('../models/Zone');
const Notification = require('../models/Notification');
const { isPointInPolygon } = require('./geofenceService');
const { cacheDriverLocation } = require('./redisService');

// We will dynamically import socket functions to avoid circular dependency issues
let socketModule = null;
const getSocketModule = () => {
  if (!socketModule) {
    socketModule = require('../config/socket');
  }
  return socketModule;
};

/**
 * Core business logic to save and broadcast driver location updates
 */
const processLocationUpdate = async (driverId, driverName, telemetry) => {
  const { latitude, longitude, speed, deliveryId } = telemetry;
  const currentPoint = [longitude, latitude]; // GeoJSON [lng, lat]
  const timestamp = new Date();

  // 1. Update Driver's current location in DB
  await Driver.findOneAndUpdate(
    { user: driverId },
    {
      currentLocation: {
        type: 'Point',
        coordinates: currentPoint
      },
      status: 'busy'
    }
  );

  // 2. Cache location coordinates in Redis
  const locationPayload = {
    driverId,
    driverName,
    latitude,
    longitude,
    speed: speed || 0,
    timestamp
  };
  await cacheDriverLocation(driverId, locationPayload);

  // 3. Log movement path if there is an active delivery
  if (deliveryId) {
    const delivery = await Delivery.findById(deliveryId);
    if (delivery && ['assigned', 'picked_up', 'in_transit'].includes(delivery.status)) {
      
      await TrackingLog.create({
        deliveryId,
        driverId,
        coordinates: {
          type: 'Point',
          coordinates: currentPoint
        },
        speed: speed || 0,
        timestamp
      });

      // Broadcast telemetry to the customer delivery room channel
      getSocketModule().sendToDeliveryRoom(deliveryId, 'location_update', locationPayload);
    }
  }

  // 4. Geofencing check
  const zones = await Zone.find({ status: 'active' });
  if (zones.length > 0) {
    let isInsideAnyZone = false;

    for (const zone of zones) {
      const inside = isPointInPolygon(currentPoint, zone.coordinates.coordinates);
      if (inside) {
        isInsideAnyZone = true;
        break;
      }
    }

    if (!isInsideAnyZone) {
      const alertMsg = `Driver ${driverName} has exited the designated delivery zones!`;
      
      // Throttle alerts: look back 1 minute
      const recentAlert = await Notification.findOne({
        recipient: null,
        type: 'route_deviation',
        message: alertMsg,
        createdAt: { $gt: new Date(Date.now() - 60 * 1000) }
      });

      if (!recentAlert) {
        const notif = await Notification.create({
          recipient: null,
          title: 'Geofence Breach Alert',
          message: alertMsg,
          type: 'route_deviation'
        });
        getSocketModule().broadcastToRole('admin', 'notification', notif);
      }
    }
  }

  // 5. Broadcast to admins watching the active fleet
  getSocketModule().broadcastToRole('admin', 'fleet_location_update', locationPayload);

  return locationPayload;
};

module.exports = {
  processLocationUpdate
};
