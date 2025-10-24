const { RateLimiterRedis } = require('rate-limiter-flexible');
const redisClient = require('../config/redis');
const logger = require('./logger');

const PLAN_LIMITS = {
  free: 10,    // 10 requests per minute
  pro: 100,    // 100 requests per minute
};

// Rate limiters will be created lazily when needed
let limiterFree = null;
let limiterPro = null;

// Function to get or create rate limiters
const getLimiters = () => {
  if (!redisClient.isRedisConnected() || !redisClient.getClient()) {
    return { limiterFree: null, limiterPro: null };
  }

  if (!limiterFree || !limiterPro) {
    limiterFree = new RateLimiterRedis({
      storeClient: redisClient.getClient(),
      keyPrefix: 'rl:free',
      points: PLAN_LIMITS.free,
      duration: 60,
    });

    limiterPro = new RateLimiterRedis({
      storeClient: redisClient.getClient(),
      keyPrefix: 'rl:pro',
      points: PLAN_LIMITS.pro,
      duration: 60,
    });
  }

  return { limiterFree, limiterPro };
};

class RateLimitHelper {
  // Get current rate limit status for a user and endpoint
  static async getRateLimitStatus(userId, endpoint, userPlan = 'free') {
    try {
      // Get rate limiters (will be null if Redis not connected)
      const { limiterFree, limiterPro } = getLimiters();
      
      if (!limiterFree || !limiterPro) {
        return {
          limit: PLAN_LIMITS[userPlan] || PLAN_LIMITS.free,
          remaining: PLAN_LIMITS[userPlan] || PLAN_LIMITS.free,
          resetTime: null,
          isLimited: false
        };
      }
      
      const key = `${endpoint}:${userId}`;
      const limiter = userPlan === 'pro' ? limiterPro : limiterFree;
      const limit = PLAN_LIMITS[userPlan] || PLAN_LIMITS.free;

      try {
        console.log("limiter", limiter);
        // Try to get current status without consuming
        const result = await limiter.get(key);

        console.log("result", result);
        if (result) {
          // Calculate remaining based on total hits
          const remaining = Math.max(0, limit - result.consumedPoints);
          console.log("Calculated remaining:", remaining, "from limit:", limit, "totalHits:", result.totalHits);

          return {
            limit,
            remaining,
            count: result.consumedPoints
          };
        } else {
          // No existing rate limit data - user hasn't made any requests yet
          console.log("No existing data, returning full limit");
          return {
            limit,
            remaining: limit,
            count: 0
          };
        }
      } catch (error) {
        console.log("Error in getRateLimitStatus:", error);
        // If get fails, assume no limit
        return {
          limit,
          remaining: limit,
          count: 0
        };
      }
    } catch (error) {
      logger.error('Rate limit status check failed', error);
      return {
        limit: PLAN_LIMITS[userPlan] || PLAN_LIMITS.free,
        remaining: PLAN_LIMITS[userPlan] || PLAN_LIMITS.free,
      };
    }
  }

  // Get rate limits for all plans
  static getRateLimits() {
    return PLAN_LIMITS;
  }

  // Reset rate limit for a user and endpoint (admin function)
  static async resetRateLimit(userId, endpoint) {
    try {
      // Get rate limiters (will be null if Redis not connected)
      const { limiterFree, limiterPro } = getLimiters();
      
      if (!limiterFree || !limiterPro) {
        return false;
      }

      const key = `${endpoint}:${userId}`;
      
      // Reset for both free and pro limiters
      await Promise.all([
        limiterFree.delete(key),
        limiterPro.delete(key)
      ]);
      
      logger.info('Rate limit reset', { userId, endpoint });
      return true;
    } catch (error) {
      logger.error('Rate limit reset failed', error);
      return false;
    }
  }
}

module.exports = RateLimitHelper;
