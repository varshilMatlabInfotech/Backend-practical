import { Router } from 'express';
import validate from 'middlewares/validate';
import { userValidation } from 'validations/user';
import auth from 'middlewares/auth';
import {
  fetchAllFriends,
  friendRequest,
  getFriendRequestWithPagination,
  sendFriendRequest,
  getFriendStats,
} from 'controllers/user/user.controller';

const router = Router();

// Fetch all friends
router.get('/friends', auth(), validate(userValidation.fetchAllFriends), fetchAllFriends);

// Send friend request
router.post('/friend', auth(), validate(userValidation.sendFriendRequest), sendFriendRequest);

// Fetch incoming friend requests with pagination (
router.get(
  '/friends-request',
  auth(),
  validate(userValidation.paginatedUser),
  getFriendRequestWithPagination
);

// Accept/Reject friend request
router.put('/friends-request/:id', auth(), validate(userValidation.friendRequest), friendRequest);

// Get friend counts by status
router.get('/friends/stats', auth(), getFriendStats);

export default router;
