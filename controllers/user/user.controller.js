import httpStatus from 'http-status';
import { catchAsync } from 'utils/catchAsync';
import { friendRequestService } from 'services';

export const fetchAllFriends = catchAsync(async (req, res) => {
  const result = await friendRequestService.getFriends(req.user.id, req.query);
  res.status(httpStatus.OK).send({ results: result });
});

export const sendFriendRequest = catchAsync(async (req, res) => {
  const result = await friendRequestService.sendFriendRequest(req.user.id, req.body);
  res.status(httpStatus.OK).send({ results: result });
});

export const friendRequest = catchAsync(async (req, res) => {
  const { id } = req.params;
  const statusOrAction = req.body.status || req.body.action;
  const result = await friendRequestService.respondToFriendRequest(req.user.id, id, statusOrAction);
  res.status(httpStatus.OK).send({ results: result });
});

export const getFriendRequestWithPagination = catchAsync(async (req, res) => {
  const result = await friendRequestService.getIncomingFriendRequests(req.user.id, req.query);
  res.status(httpStatus.OK).send({ results: result });
});

