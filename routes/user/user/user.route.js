import express from 'express';
import { userController } from 'controllers/user';
import { userValidation } from 'validations/user';
import validate from 'middlewares/validate';
import auth from 'middlewares/auth';

const router = express.Router();
router
  .route('/friends')
  /**
   * get list of friends
   * */
  .get(auth(), userController.fetchAllFriends);

router
  .route('/friend')
  /**
   * send friend request
   */
  .post(
    validate(userValidation.sendFriendRequest),
    auth(),
    userController.sendFriendRequest
  );
router
  .route('/friends-request')
  /**
   * Fetch all friend Request with pagination
   * */
  .get(
    validate(userValidation.paginatedUser),
    auth(),
    userController.getFriendRequestWithPagination
  );

router
  .route('/friends-request/:id')
  /**
   * id - Response to Friend Requests
   */
  .put(
    validate(userValidation.friendRequest),
    auth(),
    userController.friendRequest
  );

export default router;
