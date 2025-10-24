const { RateLimiterRedis } = require('rate-limiter-flexible');
const redisClient = require('../config/redis');
const logger = require('../utils/logger');

// Rate limits for each plan
const PLAN_LIMITS = {
  free: 10,    // 10 requests per minute
  pro: 100,    // 100 requests per minute
};

// Rate limiters will be created lazily when needed
let limiterFree = null;
let limiterPro = null;

// Function to get or create rate limiters
const getLimiters = () => {
  if (!redisClient.isRedisConnected()) {
    return { limiterFree: null, limiterPro: null };
  }

  if (!limiterFree || !limiterPro) {
    limiterFree = new RateLimiterRedis({
      storeClient: redisClient.getClient(),
      keyPrefix: 'rl:free',
      points: PLAN_LIMITS.free,
      duration: 60, // 60 seconds
    });

    limiterPro = new RateLimiterRedis({
      storeClient: redisClient.getClient(),
      keyPrefix: 'rl:pro',
      points: PLAN_LIMITS.pro,
      duration: 60, // 60 seconds
    });
  }

  return { limiterFree, limiterPro };
};

// Rate limiter middleware
const rateLimiter = async (req, res, next) => {
  try {
    // Skip rate limiting for non-authenticated routes
    if (!req.user || !req.user.id) {
      return next();
    }

    // Get rate limiters (will be null if Redis not connected)
    const { limiterFree, limiterPro } = getLimiters();
    
    // Skip rate limiting if Redis is not connected or limiters not available
    if (!limiterFree || !limiterPro) {
      logger.warn('Redis not connected or limiters not available, skipping rate limiting');
      return next();
    }

    const userId = req.user.id;
    const userPlan = (req.user.plans?.tier || 'free').toLowerCase();
    const endpoint = req.originalUrl;
    
    // Create unique key for user + endpoint combination
    const key = `${endpoint}:${userId}`;
    
    // Select appropriate limiter based on plan
    const limiter = userPlan === 'pro' ? limiterPro : limiterFree;
    const limit = PLAN_LIMITS[userPlan] || PLAN_LIMITS.free;

    try {
      // Consume a point from the rate limiter
      await limiter.consume(key);
      
      logger.info('Rate limit: Request allowed', { 
        userId, 
        endpoint, 
        plan: userPlan, 
        limit 
      });
      
      next();
    } catch (rej) {
      // Rate limit exceeded
      logger.warn('Rate limit exceeded', { 
        userId, 
        endpoint, 
        plan: userPlan, 
        limit,
      });
      
      return res.status(429).json({
        success: false,
        message: `Rate limit exceeded. ${userPlan} plan allows ${limit} requests per minute.`,
        endpoint,
        plan: userPlan,
        limit,
      });
    }
  } catch (error) {
    logger.error('Rate limiter error', error);
    // Don't block requests if rate limiter fails
    next();
  }
};

module.exports = rateLimiter;
