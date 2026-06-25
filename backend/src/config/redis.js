const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  retryStrategy(times) {
    // Try reconnecting every 10 seconds to reduce CPU consumption when offline
    return 10000;
  }
});

redis.on('connect', () => {
  console.log('Redis connected successfully');
});

redis.on('error', (err) => {
  console.error('Redis Connection Error:', err.message);
});

module.exports = redis;
