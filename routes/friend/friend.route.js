import express from 'express';
import auth from 'middlewares/auth';
import validate from 'middlewares/validate';
import { friendValidation } from 'validations/friend';
import { friendController } from 'controllers/friend';

const router = express.Router();

router
  .route('/friends')
  /**
   * GET /friends - list the authenticated user's friends.
   */
  .get(auth(), friendController.fetchAllFriends);

router
  .route('/friend')
  /**
   * POST /friend - send a friend request.
   */
  .post(auth(), validate(friendValidation.sendFriendRequest), friendController.sendFriendRequest);

router
  .route('/friends-request')
  /**
   * GET /friends-request - list incoming friend requests with pagination.
   */
  .get(auth(), validate(friendValidation.getIncomingFriendRequests), friendController.getIncomingFriendRequests);

router
  .route('/friends-request/:id')
  /**
   * PUT /friends-request/:id - accept or reject a friend request.
   */
  .put(auth(), validate(friendValidation.respondFriendRequest), friendController.respondFriendRequest);

export default router;
