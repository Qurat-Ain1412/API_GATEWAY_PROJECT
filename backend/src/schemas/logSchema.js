const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  apiKey: {
    type: String,
    default: "N/A",
  },
  endpoint: {
    type: String,
    required: true,
  },
  responseTime: {
    type: String,
    required: true,
  },
  cacheStatus: {
    type: String,
    enum: ["HIT", "MISS"],
    default: "MISS",
  },
  statusCode: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("log", LogSchema);
