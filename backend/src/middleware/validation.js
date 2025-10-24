const { body, param, query } = require("express-validator");

const validateSignup = [
  body("first_name")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  
  body("last_name")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),
  
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain at least one lowercase letter, one uppercase letter, and one number"),
  
  body("role")
    .optional()
    .isIn(["user"])
    .withMessage("Role must be user"),
];

const validateLogin = [
  body("identifier")
    .trim()
    .notEmpty()
    .withMessage("Email or username is required"),
  
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

const validateUpdateProfile = [
  body("first_name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  
  body("last_name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  
  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),
  
  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  
  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain at least one lowercase letter, one uppercase letter, and one number"),
];

const validateUpdatePlan = [
  body("tier")
    .notEmpty()
    .withMessage("Plan tier is required")
    .isIn(["free", "pro"])
    .withMessage("Plan tier must be either 'free' or 'pro'"),
  
  body("expiresAt")
    .optional()
    .isISO8601()
    .withMessage("Expires at must be a valid date"),
];

const validateRateLimitOverride = [
  body("endpoint")
    .notEmpty()
    .withMessage("Endpoint is required")
    .isIn(["news", "weather", "crypto", "currency", "jokes"])
    .withMessage("Endpoint must be one of: news, weather, crypto, currency, jokes"),
  
  body("limitPerMinute")
    .notEmpty()
    .withMessage("Limit per minute is required")
    .isInt({ min: 1, max: 1000 })
    .withMessage("Limit per minute must be between 1 and 1000"),
];

const validateUserId = [
  param("id")
    .isMongoId()
    .withMessage("Invalid user ID format"),
];

module.exports = {
  validateSignup,
  validateLogin,
  validateUpdateProfile,
  validateUpdatePlan,
  validateRateLimitOverride,
  validateUserId,
};
