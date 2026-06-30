/**
 * Service layer for friend-request operations.
 * Holds all business rules and database access so controllers stay thin.
 */
import httpStatus from 'http-status';
import ApiError from 'utils/ApiError';
import { FriendRequest, User } from 'models';
import { EnumFriendRequestStatus } from 'models/enum.model';

/**
 * Send a friend request from `requesterId` to `recipientId`.
 * @param {ObjectId} requesterId - Authenticated user sending the request.
 * @param {string} recipientId - Target user id.
 * @returns {Promise<FriendRequest>}
 */
export async function sendFriendRequest(requesterId, recipientId) {
  if (String(requesterId) === String(recipientId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You cannot send a friend request to yourself');
  }

  const recipient = await User.findById(recipientId);
  if (!recipient) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Recipient user not found');
  }

  // A relationship may already exist in either direction.
  const existing = await FriendRequest.findOne({
    $or: [
      { requester: requesterId, recipient: recipientId },
      { requester: recipientId, recipient: requesterId },
    ],
  });

  if (existing) {
    if (existing.status === EnumFriendRequestStatus.ACCEPTED) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'You are already friends with this user');
    }
    if (existing.status === EnumFriendRequestStatus.PENDING) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'A friend request already exists between these users');
    }
    // Previously rejected: reopen the request from the current requester.
    existing.requester = requesterId;
    existing.recipient = recipientId;
    existing.status = EnumFriendRequestStatus.PENDING;
    await existing.save();
    return existing;
  }

  return FriendRequest.create({ requester: requesterId, recipient: recipientId });
}

/**
 * Accept or reject a pending friend request.
 * Only the recipient of the request may respond to it.
 * @param {ObjectId} userId - Authenticated user responding.
 * @param {string} requestId - Friend request id.
 * @param {string} action - Either "accept" or "reject".
 * @returns {Promise<FriendRequest>}
 */
export async function respondToFriendRequest(userId, requestId, action) {
  const friendRequest = await FriendRequest.findById(requestId);
  if (!friendRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Friend request not found');
  }
  if (String(friendRequest.recipient) !== String(userId)) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You are not allowed to respond to this friend request');
  }
  if (friendRequest.status !== EnumFriendRequestStatus.PENDING) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This friend request has already been responded to');
  }

  friendRequest.status =
    action === 'accept' ? EnumFriendRequestStatus.ACCEPTED : EnumFriendRequestStatus.REJECTED;
  await friendRequest.save();
  return friendRequest;
}

/**
 * List all accepted friends of a user.
 * @param {ObjectId} userId - Authenticated user.
 * @returns {Promise<User[]>} The other side of each accepted relationship.
 */
export async function getFriends(userId) {
  const acceptedRequests = await FriendRequest.find({
    status: EnumFriendRequestStatus.ACCEPTED,
    $or: [{ requester: userId }, { recipient: userId }],
  }).populate('requester recipient', 'name email');

  // Return the counterpart user for every accepted request.
  return acceptedRequests.map((request) => {
    const isRequester = String(request.requester.id) === String(userId);
    return isRequester ? request.recipient : request.requester;
  });
}

/**
 * Build a mongoose sort object from a `field:(asc|desc)` query string.
 * @param {string} [sortBy] - e.g. "createdAt:desc".
 * @returns {Object} Mongoose sort spec (defaults to newest first).
 */
function buildSort(sortBy) {
  if (!sortBy) {
    return { createdAt: -1 };
  }
  const [field, order] = sortBy.split(':');
  return { [field]: order === 'asc' ? 1 : -1 };
}

/**
 * List incoming (pending) friend requests addressed to a user, paginated.
 * Pagination is implemented directly here because the project's pinned
 * `mongoose-paginate-v2` is incompatible with its `mongoose@5` version
 * (it calls `countDocuments(query, {})`, which mongoose 5 rejects).
 * @param {ObjectId} userId - Authenticated user.
 * @param {Object} filter - Extra mongoose filter.
 * @param {Object} options - Pagination options (page, limit, sortBy).
 * @returns {Promise<Object>} Paginated result ({ results, page, limit, totalPages, totalResults }).
 */
export async function getIncomingFriendRequests(userId, filter = {}, options = {}) {
  const query = {
    ...filter,
    recipient: userId,
    status: EnumFriendRequestStatus.PENDING,
  };

  const page = parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const limit = parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const skip = (page - 1) * limit;

  const [results, totalResults] = await Promise.all([
    FriendRequest.find(query)
      .populate('requester', 'name email')
      .sort(buildSort(options.sortBy))
      .skip(skip)
      .limit(limit),
    FriendRequest.countDocuments(query),
  ]);

  return {
    results,
    page,
    limit,
    totalPages: Math.ceil(totalResults / limit) || 0,
    totalResults,
  };
}
