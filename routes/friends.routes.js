const express = require('express');
const router = express.Router();
const friendsController = require('../controllers/friends.controller');
const { auth } = require('../middlewares/auth.middleware');

router.get('/friends', auth, friendsController.listFriends);
router.post('/friend', auth, friendsController.sendRequestValidation, friendsController.sendRequest);
router.get('/friends-request', auth, friendsController.listFriendRequests);
router.put('/friends-request/:id', auth, friendsController.respondRequestValidation, friendsController.respondRequest);

module.exports = router;
