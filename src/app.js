require("dotenv").config();

const express = require("express");
const connectDB = require("./config/connect");
const logger = require("./utils/logger");
const errorHandler = require("./middlewares/error.middleware");
const authRouter = require("./routes/auth.route");
const friendRequestRouter = require("./routes/friend-request.route");

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

const app = express();

app.use(helmet());
app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
});
app.use(limiter);

app.use(express.json());

app.get("/health", (req, res) => {
  logger.info("Health check");
  res.json({
    success: true,
    message: "Server running",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/friend", friendRequestRouter);

const startServer = async () => {
  try {
    const PORT = process.env.PORT || 3000;
    const DB_URI = process.env.DB_URI;

    await connectDB(DB_URI);

    app.listen(PORT, () => {
      logger.info(`Server is listening on port ${PORT}`);
    });
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};

app.use((req, res, next) => {
  const err = new Error(`Route not found: ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
});

app.use(errorHandler);

startServer();
