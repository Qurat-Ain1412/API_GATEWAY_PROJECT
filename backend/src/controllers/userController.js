const userService = require("../services/userService");
const { validationResult } = require("express-validator");
const logger = require("../utils/logger");
const rateLimitHelper = require("../utils/rateLimitHelper");

const signup = async (req, res) => {
  try {
    logger.info("Signup request received", req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error("Validation failed", errors.array());
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { first_name, last_name, username, email, password, role, plan } = req.body;

    logger.info("User is being Created");
    const user = await userService.createUser({
      first_name,
      last_name,
      username,
      email,
      password,
      role: role || "user",
      plan: plan || "free",
    });

    // Generate token
    const token = userService.generateToken(user);

    logger.info("User created successfully", { userId: user._id });
    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    
    // Handle specific error types
    if (error.message.includes("already exists")) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
      }));
      
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


const login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    logger.info("Login request received", req.body);
    if (!errors.isEmpty()) {
      logger.error("Login Validation failed", errors.array());
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { identifier, password } = req.body;

    const result = await userService.authenticateUser(identifier, password);
    logger.info("User is being Authenticated at Login", result);
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    console.error("Login error:", error);
    logger.error("Login error", error);
    if (error.message === "Invalid credentials" || error.message === "Account is deactivated") {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }
    logger.error("Login error", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getProfile = async (req, res) => {
  try {
    logger.info("Get profile request received", req.user.id);
    const userId = req.user.id;
    const user = await userService.findUserById(userId);
    logger.info("User is being Found by ID at Get Profile", user);
    if (!user) {
      logger.error("User not found at Get Profile");
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    logger.info("User is being Found by ID at Get Profile", user);
    return res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: { user },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error("Update profile Validation failed", errors.array());
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const updateData = req.body;

    const user = await userService.updateUser(userId, updateData);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: { user },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    
    if (error.message === "User not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
      }));
      
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


const updatePlan = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const { tier, expiresAt } = req.body;

    const planData = {
      tier,
      startedAt: new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    };

    const user = await userService.updateUserPlan(userId, planData);
    rateLimitHelper.resetRateLimit(userId, "updatePlan");
    return res.status(200).json({
      success: true,
      message: "Plan updated successfully",
      data: { user },
    });
  } catch (error) {
    console.error("Update plan error:", error);
    
    if (error.message === "User not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const addRateLimitOverride = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const { endpoint, limitPerMinute } = req.body;

    const user = await userService.addRateLimitOverride(userId, {
      endpoint,
      limitPerMinute,
    });

    return res.status(200).json({
      success: true,
      message: "Rate limit override added successfully",
      data: { user },
    });
  } catch (error) {
    console.error("Add rate limit override error:", error);
    
    if (error.message === "User not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const logout = async (req, res) => {
  try {
    const userId = req.user.id;
    logger.info("Logout request received", { userId });
    
    const result = await userService.logoutUser(userId);
    
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
      data: result,
    });
  } catch (error) {
    console.error("Logout error:", error);
    logger.error("Logout error", error);
    
    if (error.message === "User not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get rate limit status for user
const getRateLimitStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const userPlan = req.user.plans?.tier || 'free';
    
    // Define common endpoints that users might hit
    const endpoints = [
      '/api/v1/news',
      
    ];
    
    const rateLimitStatus = {};
    console.log("controller check1", endpoints);
    // Get rate limit status for each endpoint
    for (const endpoint of endpoints) {
      const status = await rateLimitHelper.getRateLimitStatus(userId, endpoint, userPlan);
      console.log("controller check2", status);
      rateLimitStatus[endpoint] = {
        limit: status.limit,
        remaining: status.remaining,
        count: status.count || 0
      };
    }
    
    res.json({
      success: true,
      data: {
        userPlan,
        endpoints: rateLimitStatus
      }
    });
  } catch (error) {
    logger.error('Get rate limit status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get rate limit status'
    });
  }
};

module.exports = {
  signup,
  login,
  logout,
  getProfile,
  updateProfile,
  updatePlan,
  addRateLimitOverride,
  getRateLimitStatus,
};
