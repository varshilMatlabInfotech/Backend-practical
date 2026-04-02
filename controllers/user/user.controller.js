import httpStatus from 'http-status';
import ApiError from 'utils/ApiError';
import { catchAsync } from 'utils/catchAsync';
import { Friend, FriendRequestStatus } from 'models/friend.model';
import { User } from 'models';

/**
 * GET /friends
 * Return the accepted friends of the logged-in user.
 * Supports: pagination (page, limit), filtering by name, sorting.
 */
export const fetchAllFriends = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10, name, sort = '-createdAt' } = req.query;

  // Find all accepted friend records that involve the logged-in user
  const acceptedRecords = await Friend.find({
    $or: [{ sender: userId }, { receiver: userId }],
    status: FriendRequestStatus.ACCEPTED,
  }).select('sender receiver');

  // Collect the IDs of the other side (the actual friends)
  const friendIds = acceptedRecords.map((f) =>
    f.sender.toString() === userId.toString() ? f.receiver : f.sender
  );

  // Build user query for filtering by name
  const userFilter = { _id: { $in: friendIds } };
  if (name) {
    userFilter.name = { $regex: name, $options: 'i' };
  }

  // Translate sort param  e.g. '-createdAt' → { createdAt: -1 }
  const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
  const sortOrder = sort.startsWith('-') ? -1 : 1;
  const sortOption = { [sortField]: sortOrder };

  const skip = (Number(page) - 1) * Number(limit);
  const [friends, totalResults] = await Promise.all([
    User.find(userFilter).sort(sortOption).skip(skip).limit(Number(limit)),
    User.countDocuments(userFilter),
  ]);

  res.status(httpStatus.OK).send({
    results: {
      friends,
      totalResults,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(totalResults / Number(limit)),
    },
  });
});

/**
 * POST /friend
 * Send a friend request to another user.
 */
export const sendFriendRequest = catchAsync(async (req, res) => {
  const senderId = req.user._id;
  const { receiverId } = req.body;

  // Cannot send a request to yourself
  if (senderId.toString() === receiverId.toString()) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You cannot send a friend request to yourself');
  }

  // Make sure the receiver exists
  const receiver = await User.findById(receiverId);
  if (!receiver) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Check if a request already exists in either direction
  const existing = await Friend.findOne({
    $or: [
      { sender: senderId, receiver: receiverId },
      { sender: receiverId, receiver: senderId },
    ],
  });

  if (existing) {
    if (existing.status === FriendRequestStatus.PENDING) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Friend request already sent');
    }
    if (existing.status === FriendRequestStatus.ACCEPTED) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'You are already friends');
    }
    if (existing.status === FriendRequestStatus.REJECTED) {
      // Allow re-sending after a rejection
      existing.sender = senderId;
      existing.receiver = receiverId;
      existing.status = FriendRequestStatus.PENDING;
      await existing.save();
      return res.status(httpStatus.OK).send({
        results: { success: true, message: 'Friend request sent', friendRequest: existing },
      });
    }
  }

  const friendRequest = await Friend.create({ sender: senderId, receiver: receiverId });

  res.status(httpStatus.CREATED).send({
    results: { success: true, message: 'Friend request sent', friendRequest },
  });
});

/**
 * PUT /friends-request/:id
 * Accept or reject an incoming friend request.
 * Body: { action: 'accepted' | 'rejected' }
 */
export const friendRequest = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  const { action } = req.body;

  const request = await Friend.findById(id);

  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Friend request not found');
  }

  // Only the receiver can respond to the request
  if (request.receiver.toString() !== userId.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You are not allowed to respond to this request');
  }

  if (request.status !== FriendRequestStatus.PENDING) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Request is already ${request.status}`);
  }

  request.status = action; // 'accepted' or 'rejected'
  await request.save();

  const message = action === FriendRequestStatus.ACCEPTED
    ? 'Friend request accepted'
    : 'Friend request rejected';

  res.status(httpStatus.OK).send({
    results: { success: true, message, friendRequest: request },
  });
});

/**
 * GET /friends-request
 * List all incoming PENDING friend requests for the logged-in user, with pagination.
 */
export const getFriendRequestWithPagination = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10 } = req.query;

  const options = {
    page: Number(page),
    limit: Number(limit),
    populate: { path: 'sender', select: 'name email' },
    sort: { createdAt: -1 },
    customLabels: { docs: 'results', totalDocs: 'totalResults' },
  };

  const filter = {
    receiver: userId,
    status: FriendRequestStatus.PENDING,
  };

  const data = await Friend.paginate(filter, options);

  res.status(httpStatus.OK).send({ results: data });
});
