const Log = require("../schemas/logSchema");
const logger = require("../utils/logger");

const saveLog = async (logData) => {
  try {
    const log = new Log(logData);
    await log.save();
    logger.info("Log saved successfully", { logId: log._id });
    return log;
  } catch (error) {
    logger.error("Failed to save log", error);
    throw error;
  }
};

module.exports = {
  saveLog,
};
