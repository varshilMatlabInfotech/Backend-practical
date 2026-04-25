import httpStatus from 'http-status';
import ApiError from 'utils/ApiError';
import { Friend, FRIEND_STATUS } from 'models/friend.model';
import User from 'models/user.model';

/**
 * Send a friend request
 * Edge cases handled:
 * - Cannot send request to yourself
 * - Cannot send request to non-existent user
 * - Cannot send duplicate request (A->B or B->A already exists)
 * - Cannot send request if already friends
 */
export const sendFriendRequest = async (requesterId, recipientId) => {
  // Cannot send request to yourself
  if (requesterId.toString() === recipientId.toString()) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You cannot send a friend request to yourself');
  }

  // Check if recipient exists
  const recipient = await User.findById(recipientId);
  if (!recipient) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Check if a friendship record already exists or not
  const existingRequest = await Friend.findOne({
    $or: [
      { requester: requesterId, recipient: recipientId },
      { requester: recipientId, recipient: requesterId },
    ],
  });

  // Only two cases are hard stops
  if (existingRequest?.status === FRIEND_STATUS.ACCEPTED) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You are already friends with this user');
  }
  if (
    existingRequest?.status === FRIEND_STATUS.PENDING &&
    existingRequest.requester.toString() === requesterId.toString()
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Friend request already sent');
  }

  // All other cases (no record, rejected, or mutual pending) → upsert
  // Mutual pending means the other user already sent us a request → auto-accept
  const newStatus =
    existingRequest?.status === FRIEND_STATUS.PENDING
      ? FRIEND_STATUS.ACCEPTED
      : FRIEND_STATUS.PENDING;

  const friendRequest = await Friend.findOneAndUpdate(
    existingRequest
      ? { _id: existingRequest._id }
      : { requester: requesterId, recipient: recipientId },
    { $set: { requester: requesterId, recipient: recipientId, status: newStatus } },
    { upsert: true, new: true }
  );

  return friendRequest;
};

/**
 * Respond to a friend request (accept/reject)
 * Edge cases:
 * - Only the recipient can accept/reject
 * - Cannot respond to non-existent request
 * - Cannot respond to already accepted/rejected request
 * - Status must be "accepted" or "rejected"
 */
export const respondToFriendRequest = async (requestId, userId, status) => {
  const friendRequest = await Friend.findById(requestId);

  if (!friendRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Friend request not found');
  }

  // Only recipient can accept/reject
  if (friendRequest.recipient.toString() !== userId.toString()) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'You can only accept or reject friend requests sent to you'
    );
  }

  if (friendRequest.status !== FRIEND_STATUS.PENDING) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `This friend request has already been ${friendRequest.status}`
    );
  }

  friendRequest.status = status;
  await friendRequest.save();

  return friendRequest;
};

/**
 * Get all accepted friends for a user with pagination, search (name/email), sorting
 *
 * This will also be optimized with the aggregation pipeline to handle the search and pagination in a more efficient way, especially when the dataset grows larger.
 * The current implementation is straightforward but may not scale well with large numbers of friendships.
 */
export const getFriends = async (userId, query) => {
  const { page = 1, limit = 10, search, sortBy = 'createdAt', order = 'desc' } = query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;
  const sortOption = { [sortBy]: order === 'asc' ? 1 : -1 };

  let filter = {
    $or: [{ requester: userId }, { recipient: userId }],
    status: FRIEND_STATUS.ACCEPTED,
  };

  if (search) {
    const regex = new RegExp(search, 'i');

    const matchedUsers = await User.find(
      { $or: [{ name: regex }, { email: regex }] },
      '_id'
    ).lean();

    if (matchedUsers.length === 0) {
      return {
        results: [],
        page: pageNum,
        limit: limitNum,
        totalPages: 0,
        totalResults: 0,
      };
    }

    const matchedUserIds = matchedUsers.map((user) => user._id);

    filter = {
      status: FRIEND_STATUS.ACCEPTED,
      $or: [
        { requester: userId, recipient: { $in: matchedUserIds } },
        { recipient: userId, requester: { $in: matchedUserIds } },
      ],
    };
  }

  const [results, totalResults] = await Promise.all([
    Friend.find(filter)
      .select('requester recipient createdAt')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .populate('requester', 'name email')
      .populate('recipient', 'name email')
      .lean(),

    Friend.countDocuments(filter),
  ]);

  const friends = results.map((doc) => {
    const isRequester = doc.requester._id.toString() === userId.toString();

    return {
      friendshipId: doc._id,
      friend: isRequester ? doc.recipient : doc.requester,
      since: doc.createdAt,
    };
  });

  return {
    results: friends,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(totalResults / limitNum),
    totalResults,
  };
};

/**
 * Get incoming friend requests for a user with pagination
 */
export const getIncomingFriendRequests = async (userId, query) => {
  const { page = 1, limit = 10 } = query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const filter = {
    recipient: userId,
    status: FRIEND_STATUS.PENDING,
  };

  // results for the fetch filtered data and totalResults for the count of the data
  const [results, totalResults] = await Promise.all([
    Friend.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('requester', 'name email'),
    Friend.countDocuments(filter),
  ]);

  return {
    results,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(totalResults / limitNum),
    totalResults,
  };
};

/**
 * Get friend request stats for a specific user
 * Returns counts of accepted friends, pending sent, pending received, rejected
 */
export const getFriendStats = async (userId) => {
  const [accepted, pendingSent, pendingReceived, rejected] = await Promise.all([
    Friend.countDocuments({
      $or: [{ requester: userId }, { recipient: userId }],
      status: FRIEND_STATUS.ACCEPTED,
    }),
    Friend.countDocuments({ requester: userId, status: FRIEND_STATUS.PENDING }),
    Friend.countDocuments({ recipient: userId, status: FRIEND_STATUS.PENDING }),
    Friend.countDocuments({
      $or: [{ requester: userId }, { recipient: userId }],
      status: FRIEND_STATUS.REJECTED,
    }),
  ]);

  return { accepted, pendingSent, pendingReceived, rejected };
};
