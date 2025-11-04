import FriendRequest from '../models/friendRequest.model.js';
import User from '../models/user.model.js';

export const sendFriendRequestService = async (fromUserId, toUserId) => {
    if (fromUserId === toUserId) {
        throw new Error('Cannot send request to yourself');
    }

    const toUser = await User.findById(toUserId);
    if (!toUser) {
        throw new Error('User not found');
    }

    const existingRequest = await FriendRequest.findOne({
        $or: [
            { from: fromUserId, to: toUserId },
            { from: toUserId, to: fromUserId },
        ],
    });

    if (existingRequest) {
        throw new Error('Friend request already exists');
    }

    const friendRequest = new FriendRequest({ from: fromUserId, to: toUserId });
    await friendRequest.save();

    return { success: true, message: 'Friend request sent successfully' };
};

export const respondToFriendRequestService = async (requestId, userId, action) => {
    const request = await FriendRequest.findById(requestId);
    if (!request) {
        throw new Error('Friend request not found');
    }

    if (request.to.toString() !== userId) {
        throw new Error('Not authorized to respond to this request');
    }

    if (request.status !== 'pending') {
        throw new Error('Request already responded');
    }

    request.status = action === 'accept' ? 'accepted' : 'rejected';
    await request.save();

    return { success: true, message: `Friend request ${action}ed successfully` };
};

export const getAllFriendsService = async (userId, { page = 1, limit = 10, sort = 'name', name }) => {
    const skip = (page - 1) * limit;

    const acceptedRequests = await FriendRequest.find({
        $or: [{ from: userId }, { to: userId }],
        status: 'accepted',
    });

    const friendIds = acceptedRequests.map((req) =>
        req.from.toString() === userId ? req.to : req.from
    );
    const query = name
        ? { _id: { $in: friendIds }, name: { $regex: name, $options: 'i' } }
        : { _id: { $in: friendIds } };

    const total = await User.countDocuments(query);
    const friends = await User.find(query)
        .sort(sort)
        .skip(parseInt(skip))
        .limit(parseInt(limit))
        .select('name email');

    return {
        success: true,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
        friends,
    };
};

export const getIncomingRequestsService = async (userId, { page = 1, limit = 10 }) => {
    const skip = (page - 1) * limit;

    const total = await FriendRequest.countDocuments({ to: userId, status: 'pending' });

    const requests = await FriendRequest.find({ to: userId, status: 'pending' })
        .populate('from', 'name email')
        .sort('-createdAt')
        .skip(parseInt(skip))
        .limit(parseInt(limit));

    return {
        success: true,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
        requests,
    };
};
