const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const auth = require('../middleware/auth');

router.get('/friends', auth, friendController.getFriends);
router.post('/friend', auth, friendController.sendFriendRequest);
router.get('/friends-request', auth, friendController.getFriendRequests);
router.put('/friends-request/:id', auth, friendController.respondToFriendRequest);

module.exports = router;
