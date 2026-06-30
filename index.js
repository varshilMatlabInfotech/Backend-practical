// Must be first: shims legacy Node APIs removed in newer versions before any
// dependency that relies on them is loaded (Babel hoists imports, so this has
// to be an import that runs ahead of the others).
import "./utils/nodeCompat";
import mongoose from "mongoose";
// TODO: implement in the future
import config from "config/config";
import { logger } from "config/logger";
import app from "./app";

let server;
mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  logger.info("Connected to MongoDB");
  server = app.listen(config.port, () => {
    logger.info(`Listening to port ${config.port}`);
  });
  require("./migrateMongo")();
  // check whether Socket is enabled or not TODO: implement in the future
});
const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info("Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};
const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};
process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);
process.on("SIGTERM", () => {
  logger.info("SIGTERM received");
  if (server) {
    server.close();
  }
});
