const pageService = require("../services/pageService");
const logger = require("../utils/logger");

const getNews = async (req, res) => {
  try {
    logger.info("News request received", { query: req.query });
    
    // Pass query parameters to service for caching
    const result = await pageService.getNews(req);
    
    res.status(200).json({
      success: true,
      message: "News fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Get news error:", error);
    logger.error("Get news error", error);
    
    res.status(500).json({
      success: false,
      message: "Failed to fetch news",
    });
  }
};



module.exports = {
  getNews,
};
