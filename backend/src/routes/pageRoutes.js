const express = require("express");
const pageController = require("../controllers/pageController");
const { authenticate } = require("../middleware/auth");
const rateLimiter = require("../middleware/rateLimiter");

const router = express.Router();

// Protected routes (require authentication)
router.use(authenticate); // All routes below require authentication
router.use(rateLimiter); // Apply rate limiting to all authenticated routes

// News API route
router.get("/news", pageController.getNews);

module.exports = router;
