const redis = require('../config/redis');

/**
 * Cache driver's current coordinates and metadata
 */
const cacheDriverLocation = async (driverId, locationData) => {
  const key = `driver:location:${driverId}`;
  try {
    // Save location details with an expiry of 15 minutes (if driver goes offline without notification)
    await redis.set(key, JSON.stringify(locationData), 'EX', 900);
  } catch (error) {
    console.error(`Redis Error caching location for driver ${driverId}:`, error.message);
  }
};

/**
 * Retrieve cached driver location
 */
const getDriverLocation = async (driverId) => {
  const key = `driver:location:${driverId}`;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Redis Error retrieving location for driver ${driverId}:`, error.message);
    return null;
  }
};

/**
 * Cache analytical/report data
 */
const cacheReport = async (reportKey, data, expireSeconds = 300) => {
  const key = `report:${reportKey}`;
  try {
    await redis.set(key, JSON.stringify(data), 'EX', expireSeconds);
  } catch (error) {
    console.error(`Redis Error caching report for key ${reportKey}:`, error.message);
  }
};

/**
 * Retrieve cached analytical/report data
 */
const getCachedReport = async (reportKey) => {
  const key = `report:${reportKey}`;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Redis Error retrieving report for key ${reportKey}:`, error.message);
    return null;
  }
};

/**
 * Invalidate cached report
 */
const invalidateReport = async (reportKey) => {
  const key = `report:${reportKey}`;
  try {
    await redis.del(key);
  } catch (error) {
    console.error(`Redis Error deleting report for key ${reportKey}:`, error.message);
  }
};

module.exports = {
  cacheDriverLocation,
  getDriverLocation,
  cacheReport,
  getCachedReport,
  invalidateReport
};
