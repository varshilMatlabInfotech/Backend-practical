const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const authMiddleware = require('../middlewares/authMiddleware');
const { sendFriendRequestValidator, respondFriendRequestValidator } = require('../validators/friendValidator');
const { validateRequest } = require('../middlewares/validateRequest');

router.use(authMiddleware);

router.post("/friend", validateRequest(sendFriendRequestValidator), friendController.sendRequest);
router.get("/friends-request", friendController.listIncoming);
router.put("/friends-request/:id", validateRequest(respondFriendRequestValidator), friendController.respondRequest);
router.get("/friends", friendController.listFriends);

module.exports = router;
