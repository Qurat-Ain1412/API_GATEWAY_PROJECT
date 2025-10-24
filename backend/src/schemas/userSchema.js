const mongoose = require("mongoose");
const { userRole, userRoleValues } = require("../enums/userRole");
const { planTier, planTierValues } = require("../enums/planTier");

const RateLimitOverrideSchema = new mongoose.Schema(
  {
    endpoint: {
      type: String,
      enum: ["news", "weather", "crypto", "currency", "jokes"],
      required: true,
    },
    limitPerMinute: { type: Number, required: true },
  },
  { _id: false }
);

const PlanSchema = new mongoose.Schema(

  {
    tier: { type: String, enum: planTierValues, default: planTier.FREE, required: true },
    startedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
  },
  { _id: false }
);

const UserSchema = mongoose.Schema({
  first_name: {
    type: String,
    required: [true, "Enter your first name"],
    trim: true,
  },
  last_name: {
    type: String,
    required: [true, "Enter your last name"],
    trim: true,
  },
  username: {
    type: String,
    required: [true, "Enter your username"],
    unique: true,
    trim: true,
    lowercase: true,
  },
  email: {
    type: String,
    required: [true, "Enter your email"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Enter your password"],
    minLength: [6, "Password must be at least 6 characters long"],
  },
  role: {
    type: String,
    enum: userRoleValues,
    default: userRole.USER,
    required: true,
  },
  plans: {
    type: PlanSchema,
    default: () => ({ tier: planTier.FREE, startedAt: new Date() })
    
  },
  rateLimitOverrides: [RateLimitOverrideSchema],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("user", UserSchema);
