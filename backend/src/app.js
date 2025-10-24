const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const logger = require("./utils/logger");
const logService = require("./services/logService");
const redisClient = require("./config/redis");
const rateLimiter = require("./middleware/rateLimiter");

// Import routes
const userRoutes = require("./routes/userRoutes");
const pageRoutes = require("./routes/pageRoutes");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/apigw";

// CORS configuration
app.use(cors({}));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// API routes
app.use("/api/users", userRoutes);
app.use("/api/v1", pageRoutes);

app.use(async (req, res, next) => {
  const start = Date.now();
  // Capture the end of response
  res.on("finish", async () => {
    const responseTime = Date.now() - start;
    const logData = {
      userId: req.user?.id || null,
      apiKey: req.headers["authorization"]?.split(" ")[1] || "N/A",
      endpoint: req.originalUrl,
      responseTime: `${responseTime}ms`,
      cacheStatus: req.cacheHit ? "HIT" : "MISS",
      statusCode: res.statusCode,
    };

    logger.info("Request logged", logData);
    try {
      await logService.saveLog(logData);
    } catch (error) {
      logger.error("Failed to save log", error);
    }
  });

  next();
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);
  
  // JWT errors
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Redis connection
const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("Connected to Redis");
  } catch (error) {
    console.error("Redis connection error:", error);
    // Don't exit process for Redis connection failure
    logger.warn("Redis connection failed, continuing without Redis");
  }
};

// Start server
const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
