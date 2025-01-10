import { Router } from "express";

import {
  fetchAllFriends,
  friendRequest,
  getFriendRequestWithPagination,
  sendRequest,
} from "../../controllers/friend/friend.controller";

const router = Router();

router.route("/friend").get(fetchAllFriends);
router.route("/friends").post(sendRequest);
router.route("/friends-request").get(getFriendRequestWithPagination);
router.route("/friends-request/:id").put(friendRequest);

export default router;
