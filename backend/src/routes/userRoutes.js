const express = require("express");
const userController = require("../controllers/userController");
const { authenticate } = require("../middleware/auth");
const rateLimiter = require("../middleware/rateLimiter");
const {
  validateSignup,
  validateLogin,
  validateUpdateProfile,
  validateUpdatePlan,
  validateRateLimitOverride,
  validateGetAllUsers,
} = require("../middleware/validation");

const router = express.Router();

// Public routes
router.post("/signup", validateSignup, userController.signup);
router.post("/login", validateLogin, userController.login);

// Protected routes (require authentication)
router.use(authenticate); // All routes below require authentication

// Rate limit status route
router.get("/rate-limit-status", userController.getRateLimitStatus);

router.use(rateLimiter); // Apply rate limiting to all other authenticated routes

// User profile routes
router.get("/profile", userController.getProfile);
router.put("/profile", validateUpdateProfile, userController.updateProfile);
router.post("/logout", userController.logout);

// Plan management routes
router.put("/plan", validateUpdatePlan, userController.updatePlan);

// Rate limit override routes
router.post("/rate-limit-override", validateRateLimitOverride, userController.addRateLimitOverride);

module.exports = router;
