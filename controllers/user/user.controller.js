import httpStatus from 'http-status';
import { catchAsync } from 'utils/catchAsync';
import * as friendService from 'services/friend.service';

/**
 * POST /friend
 * Send a friend request to another user
 * Body: { recipientId }
 */
export const sendFriendRequest = catchAsync(async (req, res) => {
  const { recipientId } = req.body;
  const requesterId = req.user.id;
  const friendRequest = await friendService.sendFriendRequest(requesterId, recipientId);
  res.status(httpStatus.CREATED).send({
    results: { success: true, message: 'Friend request sent successfully', friendRequest },
  });
});

/**
 * GET /friends
 * Fetch all accepted friends with pagination, filtering (name/email), sorting
 * Query: page, limit, search, sortBy, order
 */
export const fetchAllFriends = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await friendService.getFriends(userId, req.query);
  res.status(httpStatus.OK).send({ results: result });
});

/**
 * GET /friends-request
 * Fetch all incoming pending friend requests with pagination
 * Query: page, limit
 */
export const getFriendRequestWithPagination = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await friendService.getIncomingFriendRequests(userId, req.query);
  res.status(httpStatus.OK).send({ results: result });
});

/**
 * PUT /friends-request/:id
 * Accept or reject a friend request
 * Params: id (friend request id)
 * Body: { status: "accepted" | "rejected" }
 */
export const friendRequest = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user.id;
  const updatedRequest = await friendService.respondToFriendRequest(id, userId, status);
  res.status(httpStatus.OK).send({
    results: {
      success: true,
      message: `Friend request ${status} successfully`,
      friendRequest: updatedRequest,
    },
  });
});

/**
 * GET /friends/stats
 * Get counts of accepted friends, pending sent, pending received, rejected
 * This endpoint is use for the show stats of the current logged in user
 */
export const getFriendStats = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const stats = await friendService.getFriendStats(userId);
  res.status(httpStatus.OK).send({ results: stats });
});
