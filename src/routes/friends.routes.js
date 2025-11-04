import express from 'express';
import {
  sendFriendRequest,
  respondToFriendRequest,
  getAllFriends,
  getIncomingRequests,
} from '../controllers/friends.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  sendRequestSchema,
  respondRequestSchema,
} from '../validators/friends.validator.js';

const router = express.Router();

// Routes
router.post('/friend', protect, validate(sendRequestSchema), sendFriendRequest);
router.put('/friends-request/:id', protect, validate(respondRequestSchema), respondToFriendRequest);
router.get('/friends', protect, getAllFriends);
router.get('/friends-request', protect, getIncomingRequests);

export default router;
