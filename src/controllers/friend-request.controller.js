const FriendRequest = require("../models/friend-request.model");
const User = require("../models/user.model");
const logger = require("../utils/logger");
const { FRIEND_REQUEST_STATUS } = require("../constants/enum");

const {
  sendRequestSchema,
  respondRequestSchema,
  validate,
} = require("../validators/friend-request.validator");

const sendRequest = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body is required",
      });
    }

    const errors = validate(sendRequestSchema, req.body);
    if (errors) {
      return res.status(400).json({
        success: false,
        message: errors,
      });
    }

    const senderId = req.user.id;
    const { receiverId } = req.body;

    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        message: "You cannot send request to yourself",
      });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    const existing = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });

    if (existing) {
      if (
        existing.sender.toString() === receiverId &&
        existing.status === FRIEND_REQUEST_STATUS.PENDING
      ) {
        existing.status = FRIEND_REQUEST_STATUS.ACCEPTED;
        await existing.save();

        return res.json({
          success: true,
          message: "Friend request accepted automatically",
        });
      }

      if (existing.status === FRIEND_REQUEST_STATUS.ACCEPTED) {
        return res.status(400).json({
          success: false,
          message: "Already friends",
        });
      }

      return res.status(400).json({
        success: false,
        message: "Friend request already exists",
      });
    }

    await FriendRequest.create({
      sender: senderId,
      receiver: receiverId,
    });

    logger.info("Friend request sent", { senderId, receiverId });

    res.status(201).json({
      success: true,
      message: "Friend request sent",
    });
  } catch (err) {
    next(err);
  }
};

const respondRequest = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body is required",
      });
    }

    const errors = validate(respondRequestSchema, req.body);
    if (errors) {
      return res.status(400).json({
        success: false,
        message: errors,
      });
    }

    const { action } = req.body;

    if (!["ACCEPT", "REJECT"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action",
      });
    }

    const userId = req.user.id;
    const { id } = req.params;

    const request = await FriendRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (request.receiver.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (request.status !== FRIEND_REQUEST_STATUS.PENDING) {
      return res.status(400).json({
        success: false,
        message: "Request already processed",
      });
    }

    request.status =
      action === "ACCEPT"
        ? FRIEND_REQUEST_STATUS.ACCEPTED
        : FRIEND_REQUEST_STATUS.REJECTED;

    await request.save();

    logger.info("Friend request updated", { id, action });

    res.json({
      success: true,
      message: action === "ACCEPT" ? "Request accepted" : "Request rejected",
    });
  } catch (err) {
    next(err);
  }
};

const getFriends = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let { page = 1, limit = 10, name = "", sort = "desc" } = req.query;

    page = Number(page);
    limit = Math.min(Number(limit), 50);

    const query = {
      status: FRIEND_REQUEST_STATUS.ACCEPTED,
      $or: [{ sender: userId }, { receiver: userId }],
    };

    const total = await FriendRequest.countDocuments(query);

    const requests = await FriendRequest.find(query)
      .populate("sender receiver", "name email")
      .sort({ createdAt: sort === "asc" ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    let friends = requests.map((reqDoc) => {
      const friend =
        reqDoc.sender._id.toString() === userId
          ? reqDoc.receiver
          : reqDoc.sender;

      return {
        id: friend._id,
        name: friend.name,
        email: friend.email,
      };
    });

    if (name) {
      friends = friends.filter((f) =>
        f.name.toLowerCase().includes(name.toLowerCase()),
      );
    }

    res.json({
      success: true,
      count: friends.length,
      total,
      page,
      limit,
      data: friends,
    });
  } catch (err) {
    next(err);
  }
};

const getIncomingRequests = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let { page = 1, limit = 10 } = req.query;

    page = Number(page);
    limit = Math.min(Number(limit), 50);

    const query = {
      receiver: userId,
      status: FRIEND_REQUEST_STATUS.PENDING,
    };

    const total = await FriendRequest.countDocuments(query);

    const requests = await FriendRequest.find(query)
      .populate("sender", "name email")
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      count: requests.length,
      total,
      page,
      limit,
      data: requests,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  sendRequest,
  respondRequest,
  getFriends,
  getIncomingRequests,
};
