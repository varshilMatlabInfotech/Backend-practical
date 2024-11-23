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
  .get(
    auth(),
    validate(userValidation.fetchAllFriends),
    userController.fetchAllFriends
  );

router
  .route('/friend')
  /**
   * send friend request
   */
  .post(
    auth(),
    validate(userValidation.sendFriendRequest),
    userController.sendFriendRequest
  );
router
  .route('/friends-request')
  /**
   * Fetch all friend Request with pagination
   * */
  .get(
    auth(),
    validate(userValidation.paginatedUser),
    userController.getFriendRequestWithPagination
  );

router
  .route('/friends-request/:id')
  /**
   * id - Response to Friend Requests
   */
  .put(
    auth(),
    validate(userValidation.friendRequest),
    userController.friendRequest
  );

export default router;
