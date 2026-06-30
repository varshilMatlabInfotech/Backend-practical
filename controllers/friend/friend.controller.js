/**
 * Controllers for the friend APIs.
 * They are intentionally thin: validate-then-delegate to the service layer and
 * shape the HTTP response. All errors bubble up to the error middleware via catchAsync.
 */
import httpStatus from 'http-status';
import { pick } from 'utils/pick';
import { catchAsync } from 'utils/catchAsync';
import { friendService } from 'services';

/**
 * POST /friend
 * Send a friend request to another user.
 */
export const sendFriendRequest = catchAsync(async (req, res) => {
  const friendRequest = await friendService.sendFriendRequest(req.user._id, req.body.recipientId);
  res.status(httpStatus.CREATED).send({ results: { success: true, friendRequest } });
});

/**
 * PUT /friends-request/:id
 * Respond (accept/reject) to a received friend request.
 */
export const respondFriendRequest = catchAsync(async (req, res) => {
  const friendRequest = await friendService.respondToFriendRequest(req.user._id, req.params.id, req.body.action);
  res.status(httpStatus.OK).send({ results: { success: true, friendRequest } });
});

/**
 * GET /friends
 * List the authenticated user's friends.
 */
export const fetchAllFriends = catchAsync(async (req, res) => {
  const friends = await friendService.getFriends(req.user._id);
  res.status(httpStatus.OK).send({ results: { success: true, friends } });
});

/**
 * GET /friends-request
 * List incoming (pending) friend requests with pagination.
 */
export const getIncomingFriendRequests = catchAsync(async (req, res) => {
  const options = pick(req.query, ['page', 'limit', 'sortBy']);
  const friendRequests = await friendService.getIncomingFriendRequests(req.user._id, {}, options);
  res.status(httpStatus.OK).send({ results: friendRequests });
});
