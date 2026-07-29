import ApiError from 'utils/ApiError';
import httpStatus from 'http-status';
import { User, FriendRequest } from 'models';

/**
 * Send a friend request
 * @param {ObjectId} senderId
 * @param {Object} receiverData
 * @returns {Promise<FriendRequest>}
 */
export async function sendFriendRequest(senderId, { receiverId, email }) {
  let receiver;
  if (receiverId) {
    receiver = await User.findById(receiverId);
  } else if (email) {
    receiver = await User.findOne({ email });
  }

  if (!receiver) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Receiver user not found');
  }

  if (senderId.toString() === receiver.id.toString()) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You cannot send a friend request to yourself');
  }

  // Check if a friend request already exists
  const existingRequest = await FriendRequest.findOne({
    $or: [
      { sender: senderId, receiver: receiver.id },
      { sender: receiver.id, receiver: senderId },
    ],
  });

  if (existingRequest) {
    if (existingRequest.status === 'accepted') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'You are already friends with this user');
    }
    if (existingRequest.status === 'pending') {
      if (existingRequest.sender.toString() === senderId.toString()) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Friend request already sent and is pending');
      } else {
        throw new ApiError(httpStatus.BAD_REQUEST, 'You have a pending friend request from this user');
      }
    }
    if (existingRequest.status === 'rejected') {
      // Re-send by updating the existing request
      existingRequest.sender = senderId;
      existingRequest.receiver = receiver.id;
      existingRequest.status = 'pending';
      await existingRequest.save();
      return existingRequest;
    }
  }

  const friendRequest = await FriendRequest.create({
    sender: senderId,
    receiver: receiver.id,
    status: 'pending',
  });

  return friendRequest;
}

/**
 * Respond to a friend request (Accept or Reject)
 * @param {ObjectId} userId
 * @param {ObjectId} requestId
 * @param {string} statusOrAction
 * @returns {Promise<FriendRequest>}
 */
export async function respondToFriendRequest(userId, requestId, statusOrAction) {
  const friendRequest = await FriendRequest.findById(requestId);
  if (!friendRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Friend request not found');
  }

  if (friendRequest.receiver.toString() !== userId.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can only respond to friend requests sent to you');
  }

  if (friendRequest.status === 'accepted') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Friend request already accepted');
  }
  if (friendRequest.status === 'rejected') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Friend request already rejected');
  }

  let targetStatus;
  const actionLower = statusOrAction.toLowerCase();
  if (actionLower === 'accepted' || actionLower === 'accept') {
    targetStatus = 'accepted';
  } else if (actionLower === 'rejected' || actionLower === 'reject') {
    targetStatus = 'rejected';
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid response action/status');
  }

  friendRequest.status = targetStatus;
  await friendRequest.save();
  return friendRequest;
}

/**
 * Fetch incoming friend requests with pagination and sorting
 * @param {ObjectId} userId
 * @param {Object} query
 * @returns {Promise<Object>}
 */
export async function getIncomingFriendRequests(userId, query) {
  const filter = {
    receiver: userId,
  };

  if (query.status) {
    filter.status = query.status;
  }

  const options = {
    page: parseInt(query.page, 10) || 1,
    limit: parseInt(query.limit, 10) || 10,
    populate: 'sender',
  };

  // Parse sortBy
  if (query.sortBy) {
    const sort = {};
    query.sortBy.split(',').forEach((sortOption) => {
      const [key, order] = sortOption.split(':');
      sort[key] = order === 'desc' ? -1 : 1;
    });
    options.sort = sort;
  } else {
    options.sort = { createdAt: -1 };
  }

  const paginatedResult = await FriendRequest.paginate(filter, options);
  return paginatedResult;
}

/**
 * Fetch all friends with pagination, filtering, and sorting
 * @param {ObjectId} userId
 * @param {Object} query
 * @returns {Promise<Object>}
 */
export async function getFriends(userId, query) {
  // First, find all accepted friend requests involving this user
  const acceptedRequests = await FriendRequest.find({
    status: 'accepted',
    $or: [
      { sender: userId },
      { receiver: userId },
    ],
  });

  const friendIds = acceptedRequests.map((req) =>
    req.sender.toString() === userId.toString() ? req.receiver : req.sender
  );

  // Build query filter for User model
  const filter = {
    _id: { $in: friendIds },
  };

  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
    ];
  }

  const options = {
    page: parseInt(query.page, 10) || 1,
    limit: parseInt(query.limit, 10) || 10,
  };

  // Parse sortBy
  if (query.sortBy) {
    const sort = {};
    query.sortBy.split(',').forEach((sortOption) => {
      const [key, order] = sortOption.split(':');
      sort[key] = order === 'desc' ? -1 : 1;
    });
    options.sort = sort;
  } else {
    options.sort = { name: 1 };
  }

  const paginatedResult = await User.paginate(filter, options);
  return paginatedResult;
}
