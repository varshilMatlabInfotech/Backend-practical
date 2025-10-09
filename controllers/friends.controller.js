const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');
const { body, validationResult, param, query } = require('express-validator');
const mongoose = require('mongoose');

function parsePagination(req) {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

exports.sendRequestValidation = [
  body('to').custom((v) => mongoose.Types.ObjectId.isValid(v)),
  body('message').optional().isString()
];

exports.sendRequest = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const fromId = req.user._id;
    const { to, message } = req.body;

    if (String(fromId) === String(to)) return res.status(400).json({ error: 'Cannot send friend request to yourself' });

    const toUser = await User.findById(to);
    if (!toUser) return res.status(404).json({ error: 'Recipient not found' });

    if (toUser.friends && toUser.friends.includes(fromId)) {
      return res.status(400).json({ error: 'You are already friends' });
    }

    const existing = await FriendRequest.findOne({ $or: [{ from: fromId, to }, { from: to, to: fromId }] });
    if (existing) {
      if (existing.status === 'pending') return res.status(409).json({ error: 'There is already a pending friend request between you and this user' });
      if (existing.status === 'accepted') return res.status(400).json({ error: 'You are already friends' });
    }

    const request = await FriendRequest.create({ from: fromId, to, message });
    res.status(201).json({ request });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Friend request already exists' });
    next(err);
  }
};

exports.respondRequestValidation = [
  param('id').custom((v) => mongoose.Types.ObjectId.isValid(v)),
  body('action').isIn(['accept', 'reject'])
];

exports.respondRequest = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const reqId = req.params.id;
    const { action } = req.body;
    const userId = req.user._id;

    const fr = await FriendRequest.findById(reqId);
    if (!fr) return res.status(404).json({ error: 'Friend request not found' });

    if (String(fr.to) !== String(userId)) return res.status(403).json({ error: 'You are not authorized to respond to this request' });
    if (fr.status !== 'pending') return res.status(400).json({ error: `This request has already been ${fr.status}` });

    if (action === 'accept') {
      await User.updateOne({ _id: fr.from, friends: { $ne: fr.to } }, { $push: { friends: fr.to } });
      await User.updateOne({ _id: fr.to, friends: { $ne: fr.from } }, { $push: { friends: fr.from } });
      fr.status = 'accepted';
      await fr.save();
      return res.json({ message: 'Friend request accepted', request: fr });
    } else {
      fr.status = 'rejected';
      await fr.save();
      return res.json({ message: 'Friend request rejected', request: fr });
    }
  } catch (err) {
    next(err);
  }
};

exports.listFriends = async (req, res, next) => {
  try {
    const { limit, skip, page } = parsePagination(req);
    const search = req.query.name ? req.query.name.trim() : null;
    const sortQuery = req.query.sort || 'name:asc';
    const [field, dir] = sortQuery.split(':');
    const sort = { [field]: dir === 'desc' ? -1 : 1 };

    const user = await User.findById(req.user._id).populate({
      path: 'friends',
      match: search ? { name: { $regex: search, $options: 'i' } } : {},
      select: 'name email createdAt',
      options: { skip, limit, sort }
    });

    const friends = user.friends || [];

    const query = { _id: { $in: (await User.findById(req.user._id)).friends } };
    if (search) query.name = { $regex: search, $options: 'i' };
    const total = await User.countDocuments(query);

    res.json({ page, limit, total, friends });
  } catch (err) {
    next(err);
  }
};

exports.listFriendRequests = async (req, res, next) => {
  try {
    const { limit, skip, page } = parsePagination(req);
    const type = req.query.type === 'outgoing' ? 'outgoing' : 'incoming';
    const status = req.query.status;

    const filter = {};
    if (type === 'incoming') filter.to = req.user._id; else filter.from = req.user._id;
    if (status && ['pending', 'accepted', 'rejected'].includes(status)) filter.status = status;

    const sortQuery = req.query.sort || 'createdAt:desc';
    const [field, dir] = sortQuery.split(':');
    const sort = { [field]: dir === 'desc' ? -1 : 1 };

    const total = await FriendRequest.countDocuments(filter);
    const requests = await FriendRequest.find(filter).populate('from to', 'name email').sort(sort).skip(skip).limit(limit);

    res.json({ page, limit, total, requests });
  } catch (err) {
    next(err);
  }
};

exports.getFriendRequest = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' });
    const fr = await FriendRequest.findById(id).populate('from to', 'name email');
    if (!fr) return res.status(404).json({ error: 'Friend request not found' });
    res.json({ request: fr });
  } catch (err) {
    next(err);
  }
};
