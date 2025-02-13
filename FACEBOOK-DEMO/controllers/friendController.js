const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');

// GET /friends - List friends with pagination, filtering, and sorting
exports.getFriends = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, name = '', sort = 'username' } = req.query;
    
    // Populate the 'friends' field with filtering & pagination options
    const user = await User.findById(userId).populate({
      path: 'friends',
      match: { username: { $regex: name, $options: 'i' } },
      options: {
        sort: { [sort]: 1 },
        skip: (page - 1) * limit,
        limit: parseInt(limit)
      }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ friends: user.friends });
  } catch (error) {
    next(error);
  }
};

// POST /friend - Send a friend request
exports.sendFriendRequest = async (req, res, next) => {
  try {
    const fromUserId = req.user.userId;
    const { toUserId } = req.body;
    
    if (fromUserId === toUserId) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }
    
    // Verify target user exists
    const toUser = await User.findById(toUserId);
    if (!toUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if already friends
    const fromUser = await User.findById(fromUserId);
    if (fromUser.friends.includes(toUserId)) {
      return res.status(400).json({ message: 'Already friends' });
    }
    
    // Check if a pending request already exists
    const existingRequest = await FriendRequest.findOne({
      from: fromUserId,
      to: toUserId,
      status: 'pending'
    });
    
    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }
    
    const friendRequest = new FriendRequest({ from: fromUserId, to: toUserId });
    await friendRequest.save();
    
    res.status(201).json({ message: 'Friend request sent' });
  } catch (error) {
    next(error);
  }
};

// GET /friends-request - List incoming friend requests with pagination
exports.getFriendRequests = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;
    
    const friendRequests = await FriendRequest.find({ to: userId, status: 'accepted' })
      .populate('from', 'username email')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
      
    res.json({ requests: friendRequests });
  } catch (error) {
    next(error);
  }
};

// PUT /friends-request/:id - Respond to a friend request (accept/reject)
exports.respondFriendRequest = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const requestId = req.params.id;
    const { action } = req.body; // expected: 'accept' or 'reject'
    
    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Use accept or reject.' });
    }
    
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }
    
    if (friendRequest.to.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to respond to this friend request' });
    }
    
    if (friendRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Friend request already responded to' });
    }
    
    friendRequest.status = action === 'accept' ? 'accepted' : 'rejected';
    await friendRequest.save();
    
    // If accepted, add each user to the other's friends list
    if (action === 'accept') {
      await User.findByIdAndUpdate(userId, { $addToSet: { friends: friendRequest.from } });
      await User.findByIdAndUpdate(friendRequest.from, { $addToSet: { friends: userId } });
    }
    
    res.json({ message: `Friend request ${action}ed successfully` });
  } catch (error) {
    next(error);
  }
};
