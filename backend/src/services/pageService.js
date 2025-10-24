const logger = require("../utils/logger");
const SimpleCache = require("../utils/simpleCache");

const getNews = async (req) => {
  try {
    const { query = {} } = req;
    // Generate cache key
    const cacheKey = SimpleCache.generateKey('news', query);
    
    // Try to get from cache first
    const cachedData = await SimpleCache.get(cacheKey);
    if (cachedData) {
      logger.info("News served from cache", { cacheKey });
      req.cacheHit = "HIT";
      return cachedData;
    }
    req.cacheHit = "MISS";
    // Cache miss - fetch from external API
    logger.info("Fetching news from external API");
    const NEWS_API_KEY = process.env.NEWS_API_KEY;
    const country = query.country || 'us';
    const newsUrl = `https://newsapi.org/v2/top-headlines?country=${country}&apikey=${NEWS_API_KEY}`;
    
    const response = await fetch(newsUrl);
    const data = await response.json();
    
    if (data.status === 'ok') {
      const result = {
        success: true,
        articles: data.articles,
        totalResults: data.totalResults
      };
      
      // Cache the response for 5 minutes
      await SimpleCache.set(cacheKey, result, 300);
      
      logger.info("News fetched and cached successfully", { 
        articlesCount: data.articles.length,
        cacheKey 
      });
      
      return result;
    } else {
      logger.error("News API error", data);
      throw new Error(data.message || 'Failed to fetch news');
    }
  } catch (error) {
    logger.error("News fetch failed", error);
    throw error;
  }
};



module.exports = {
  getNews,
};
