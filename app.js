const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const app = express();

const authRoutes = require("./routes/authRoutes");
const friendRoutes = require("./routes/friendRoutes");
const { response } = require("./utils/response");

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});

app.use("/api", authRoutes);
app.use("/api", friendRoutes);

// Error Handling
app.use((err, req, res, next) => {
  response.error(res, err.message || "Server Error", 500);
});

module.exports = app;
