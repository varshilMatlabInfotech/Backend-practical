const express = require('express');
const router = express.Router();
const {
  getFriends,
  sendFriendRequest,
  getFriendRequests,
  respondFriendRequest
} = require('../controllers/friendController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all friend-related endpoints
router.use(authMiddleware);

// GET /friends - List friends (with pagination, filtering, sorting)
router.get('/friends', getFriends);

// POST /friend - Send a friend request
router.post('/friend', sendFriendRequest);

// GET /friends-request - List incoming friend requests
router.get('/friends-request', getFriendRequests);

// PUT /friends-request/:id - Respond (accept/reject) to a friend request
router.put('/friends-request/:id', respondFriendRequest);

module.exports = router;
