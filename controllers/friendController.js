const FriendRequest = require("../models/FriendRequest");
const User = require("../models/User");
const { response } = require("../utils/response");


exports.sendRequest = async (req, res) => {
  try {
    const { to } = req.body;
    const from = req.user._id;

    if (from.equals(to)) {
      return response.validationError(res, [{ field: "to", message: "You can't friend yourself." }]);
    }

    const existing = await FriendRequest.findOne({ from, to });
    if (existing) {
      return response.error(res, "Friend request already sent", 400);
    }

    const request = await FriendRequest.create({ from, to });
    return response.success(res, "Friend request sent", request, 201);
  } catch (err) {
    return response.error(res, err.message);
  }
};

exports.listIncoming = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const requests = await FriendRequest.find({ to: req.user._id, status: "pending" })
      .populate("from", "name email")
      .limit(limit * 1)
      .skip((page - 1) * limit);

    return response.success(res, "Incoming friend requests", requests);
  } catch (err) {
    return response.error(res, err.message);
  }
};

exports.respondRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    const request = await FriendRequest.findById(id);
    if (!request || !request.to.equals(req.user._id)) {
      return response.error(res, "Request not found", 404);
    }

    if (action === "accept") {
      request.status = "accepted";
      await request.save();
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { friends: request.from } });
      await User.findByIdAndUpdate(request.from, { $addToSet: { friends: request.to } });
    } else if (action === "reject") {
      request.status = "rejected";
      await request.save();
    } else {
      return response.validationError(res, [{ field: "action", message: "Action must be 'accept' or 'reject'" }]);
    }

    return response.success(res, `Friend request ${action}ed`, request);
  } catch (err) {
    return response.error(res, err.message);
  }
};

exports.listFriends = async (req, res) => {
  try {
    const { page = 1, limit = 10, name, sort = "name" } = req.query;

    let query = { _id: { $in: req.user.friends } };
    if (name) query.name = new RegExp(name, "i");

    const friends = await User.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    return response.success(res, "Friends list", friends);
  } catch (err) {
    return response.error(res, err.message);
  }
};
