const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async (DB_URI) => {
  try {
    if (!DB_URI) {
      throw new Error("DB_URI is missing in environment variables");
    }

    await mongoose.connect(DB_URI);

    logger.info("MongoDB connected successfully");
  } catch (err) {
    logger.error(err);
    throw err;
  }
};

module.exports = connectDB;
