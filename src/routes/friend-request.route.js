const express = require("express");
const router = express.Router();

const {
  sendRequest,
  respondRequest,
  getFriends,
  getIncomingRequests,
} = require("../controllers/friend-request.controller");

const authMiddleware = require("../middlewares/auth.middleware");

router.post("/", authMiddleware, sendRequest);

router.patch("/request/:id", authMiddleware, respondRequest);

router.get("/", authMiddleware, getFriends);

router.get("/requests", authMiddleware, getIncomingRequests);

module.exports = router;
