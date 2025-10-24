const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../schemas/userSchema");
const { userRole } = require("../enums/userRole");
const { planTier } = require("../enums/planTier");
const logger = require("../utils/logger");

const JWT_SECRET = process.env.JWT_SECRET || "supersecret_dev";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const hashPassword = async (password) => {
  logger.info("Password is being Hashed", password);
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

const comparePassword = async (password, hashedPassword) => {
  logger.info("Password is being Compared", password, hashedPassword);
  return await bcrypt.compare(password, hashedPassword);
};

const generateToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    username: user.username,
    role: user.role,
  };
  logger.info("Token is being Generated", payload);
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const createUser = async (userData) => {
  try {
    const { password, ...otherData } = userData;
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: userData.email },
        { username: userData.username }
      ]
    });

    if (existingUser) {
      const field = existingUser.email === userData.email ? "email" : "username";
      logger.error(`${field} already exists`);
      throw new Error(`${field} already exists`);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);
    logger.info("Password has been Hashed", hashedPassword);
    // Create user
    const user = new User({
      ...otherData,
      password: hashedPassword,
      plans: {
        tier: userData.plan || planTier.FREE,
        startedAt: new Date(),
      }
    });
    logger.info("User is being Saved", user);
    const savedUser = await user.save();
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = savedUser.toObject();
    logger.info("User has been Saved Successfully", userWithoutPassword);
    console.log("userWithoutPassword", userWithoutPassword);
    return userWithoutPassword;
  } catch (error) {
    throw error;
  }
};

const findUserByEmail = async (email) => {
  logger.info("User is being Found by Email", email);
  return await User.findOne({ email: email.toLowerCase() });
};

const findUserByUsername = async (username) => {
  logger.info("User is being Found by Username", username);
  return await User.findOne({ username: username.toLowerCase() });
};

const findUserById = async (id) => {
  logger.info("User is being Found by ID", id);
  return await User.findById(id).select("-password");
};

const authenticateUser = async (identifier, password) => {
  try {
    logger.info("User is being Authenticated", identifier, password);
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier.toLowerCase() }
      ]
    });

    if (!user) {
      logger.error("User not found");
      throw new Error("Invalid credentials");
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      logger.error("Invalid credentials");
      throw new Error("Invalid credentials");
    }

    // Update last login
    user.lastLogin = new Date();
    logger.info("User last login is being Updated", user);
    await user.save();

    // Generate token
    const token = generateToken(user);
    logger.info("Token is being Generated", token);
    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toObject();
    logger.info("User authentication successful", userWithoutPassword);
    return {
      user: userWithoutPassword,
      token
    };
  } catch (error) {
    logger.error("User authentication failed", error);
    throw error;
  }
};

const updateUserPlan = async (userId, planData) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { plans: planData },
      { new: true, runValidators: true }
    ).select("-password");
    logger.info("User plan is being Updated", user);
    if (!user) {
      logger.error("User not found");
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    throw error;
  }
};

const addRateLimitOverride = async (userId, overrideData) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const existingOverride = user.rateLimitOverrides.find(
      override => override.endpoint === overrideData.endpoint
    );

    if (existingOverride) {
      logger.info("Existing override is being Updated", existingOverride);
      existingOverride.limitPerMinute = overrideData.limitPerMinute;
    } else {
      logger.info("New override is being Added", overrideData);
      user.rateLimitOverrides.push(overrideData);
    }
    logger.info("User rate limit overrides are being Saved", user);
    await user.save();
    return user;
  } catch (error) {
    logger.error("User rate limit override failed", error);
    throw error;
  }
};

const logoutUser = async (userId) => {
  try {
    logger.info("User is being logged out", userId);
    // Update last login to current time (logout time)
    const user = await User.findByIdAndUpdate(
      userId,
      { lastLogin: new Date() },
      { new: true }
    ).select("-password");
    
    if (!user) {
      logger.error("User not found for logout");
      throw new Error("User not found");
    }
    
    logger.info("User logged out successfully", { userId: user._id });
    return { success: true, message: "Logged out successfully" };
  } catch (error) {
    logger.error("Logout failed", error);
    throw error;
  }
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserByUsername,
  findUserById,
  authenticateUser,
  updateUserPlan,
  addRateLimitOverride,
  logoutUser,
  hashPassword,
  comparePassword,
  generateToken,
};
