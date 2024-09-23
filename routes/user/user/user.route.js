import express from 'express';
import { userController } from 'controllers/user';
import { userValidation } from 'validations/user';
import validate from 'middlewares/validate';

const router = express.Router();
router
  .route('/friends')
  /**
   * get list of friends
   * */
  .get(validate(userValidation.fetchAllFriends), userController.fetchAllFriends);

router
  .route('/friend')
  /**
   * send friend request
   */
  .post(validate(userValidation.sendFriendRequest), userController.sendFriendRequest);
router
  .route('/friends-request')
  /**
   * Fetch all friend Request with pagination
   * */
  .get(validate(userValidation.paginatedUser), userController.getFriendRequestWithPagination);

router
  .route('/friends-request/:id')
  /**
   * id - Response to Friend Requests
   */
  .put(validate(userValidation.friendRequest), userController.friendRequest);

export default router;
