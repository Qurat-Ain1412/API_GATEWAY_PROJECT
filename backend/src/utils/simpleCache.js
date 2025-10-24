const redisClient = require('../config/redis');
const logger = require('./logger');

class SimpleCache {
  // Set cache with expiration (in seconds)
  static async set(key, value, expiration = 300) {
    try {
      if (!redisClient.isRedisConnected()) {
        return false;
      }

      const client = redisClient.getClient();
      const stringValue = JSON.stringify(value);
      await client.setEx(key, expiration, stringValue);
      
      logger.info('Data cached', { key, expiration });
      return true;
    } catch (error) {
      logger.error('Cache set failed', error);
      return false;
    }
  }

  // Get cache value
  static async get(key) {
    try {
      if (!redisClient.isRedisConnected()) {
        return null;
      }

      const client = redisClient.getClient();
      const value = await client.get(key);
      
      if (value) {
        logger.info('Cache hit', { key });
        return JSON.parse(value);
      }
      
      logger.info('Cache miss', { key });
      return null;
    } catch (error) {
      logger.error('Cache get failed', error);
      return null;
    }
  }

  // Generate cache key for API calls
  static generateKey(apiName, params = {}) {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    return `api:${apiName}${paramString ? `:${paramString}` : ''}`;
  }
}

module.exports = SimpleCache;
