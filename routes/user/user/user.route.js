import express from 'express';
import { userController } from 'controllers/user';
import { userValidation } from 'validations/user';
import validate from 'middlewares/validate';
import auth from 'middlewares/auth';

const router = express.Router();

// All friend routes require authentication
router
  .route('/friends')
  /**
   * GET /friends
   * Fetch the logged-in user's accepted friends.
   * Query params: page, limit, name (filter), sort
   */
  .get(auth(), validate(userValidation.fetchAllFriends), userController.fetchAllFriends);

router
  .route('/friend')
  /**
   * POST /friend
   * Send a friend request to another user.
   * Body: { receiverId }
   */
  .post(auth(), validate(userValidation.sendFriendRequest), userController.sendFriendRequest);

router
  .route('/friends-request')
  /**
   * GET /friends-request
   * Fetch all incoming pending friend requests (paginated).
   * Query params: page, limit
   */
  .get(auth(), validate(userValidation.paginatedUser), userController.getFriendRequestWithPagination);

router
  .route('/friends-request/:id')
  /**
   * PUT /friends-request/:id
   * Accept or reject a friend request.
   * Body: { action: 'accepted' | 'rejected' }
   */
  .put(auth(), validate(userValidation.friendRequest), userController.friendRequest);

export default router;
