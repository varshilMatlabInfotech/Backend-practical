import { isValidObjectId } from "mongoose";
import { catchAsync } from "utils/catchAsync.js";
import ApiError from "../../utils/ApiError.js";
import { Friend } from "../../models/friend.model.js";

export const fetchAllFriends = catchAsync(async (req, res) => {
  // get friends logic
  const { friendId } = req.params;
  const { userId } = req.body;
  if (!isValidObjectId(userId)) {
    throw new ApiError("invaild user", 400);
  }
  try {
    const allFriend = await Friend.findById({ friendId });
    if (!allFriend) {
      throw new ApiError("failed to fetch friends", 400);
    }
    return res.status(200).json(allFriend);
  } catch (error) {
    return res.status(400).json(400, new ApiError("faild to fetch all friend"));
  }
});

export const sendRequest = catchAsync(async (req, res) => {
  // send friend request logic here
  const { friendId } = req.params;
  const { userId } = req.body;
  if (!isValidObjectId(userId)) {
    throw new ApiError("friend is invaild:", 400);
  }
  try {
    const sendFriendRequest = await Friend.findOne({ friendId });
    if (!sendFriendRequest) {
      throw new ApiError("friend is not find:", 400);
    }
    return res.status(200).json(
      200,
      {
        sucsess: true,
        message: "send friend request",
      },
      sendFriendRequest
    );
  } catch (error) {
    return res
      .status(400)
      .json(400, new ApiError("faild to send friend request", error));
  }
});

export const friendRequest = catchAsync(async (req, res) => {
  const { friendId } = req.params;
  const { userId } = req.body;
  if (!isValidObjectId(userId)) {
    throw new ApiError("Friend is not vaild:", 400);
  }
  try {
    const request = await Friend.findOne({ friendId });
    if (!request) {
      throw new ApiError("friend request is not vaild:", 400);
    }
    return res.status(200).json({ request });
  } catch (error) {
    return res
      .status(400)
      .json(400, new ApiError("faild to friend request", error));
  }
});
export const getFriendRequestWithPagination = catchAsync(async (req, res) => {
  // paginate api logic
  const { friendId } = req.params;
  const { userId } = req.body;
  if (!isValidObjectId(userId)) {
    throw new ApiError("user is invaild:", 400);
  }
  try {
    const response = await Friend.findByIdAndUpdate({ friendId });
    if (!response) {
      throw new ApiError("failed to pagination:", 400);
    }
    return res.status(200).json({ response });
  } catch (error) {
    res
      .status(400)
      .json(new ApiError("faild to Pagination friend request", error));
  }
});
