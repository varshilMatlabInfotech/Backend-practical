const FriendRequest = require('../models/FriendRequest');
const Friendship = require('../models/Friendship');
const User = require('../models/User');

exports.sendFriendRequest = async (req, res, next) => {
    try {
        const senderId = req.user.id;
        const { receiverId } = req.body;

        if (!receiverId) {
            const err = new Error('Receiver ID is required');
            err.statusCode = 400;
            throw err;
        }

        if (senderId === receiverId) {
            const err = new Error('You cannot send a friend request to yourself');
            err.statusCode = 400;
            throw err;
        }

        const receiver = await User.findById(receiverId);
        if (!receiver) {
            const err = new Error('Receiver not found');
            err.statusCode = 404;
            throw err;
        }

        const existingRequest = await FriendRequest.findOne({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId }
            ],
            status: { $in: ['pending', 'accepted'] }
        });

        if (existingRequest) {
            const err = new Error('A friend request already exists or you are already friends');
            err.statusCode = 400;
            throw err;
        }

        const friendRequest = new FriendRequest({
            sender: senderId,
            receiver: receiverId,
            status: 'pending'
        });

        await friendRequest.save();

        res.status(201).json({ message: 'Friend request sent successfully', friendRequest });
    } catch (err) {
        next(err);
    }
};

exports.respondToFriendRequest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.id;

        if (!['accepted', 'rejected'].includes(status)) {
            const err = new Error('Status must be accepted or rejected');
            err.statusCode = 400;
            throw err;
        }

        const friendRequest = await FriendRequest.findById(id);
        if (!friendRequest) {
            const err = new Error('Friend request not found');
            err.statusCode = 404;
            throw err;
        }

        if (friendRequest.receiver.toString() !== userId) {
            const err = new Error('Not authorized to respond to this friend request');
            err.statusCode = 403;
            throw err;
        }

        if (friendRequest.status !== 'pending') {
            const err = new Error('Friend request is already processed');
            err.statusCode = 400;
            throw err;
        }

        friendRequest.status = status;
        await friendRequest.save();

        if (status === 'accepted') {
            const friendship = new Friendship({
                user1: friendRequest.sender,
                user2: friendRequest.receiver
            });
            await friendship.save();
        }

        res.status(200).json({ message: `Friend request ${status}`, friendRequest });
    } catch (err) {
        next(err);
    }
};

exports.getFriends = async (req, res, next) => {
    try {
        const userId = req.user.id;
        let { page = 1, limit = 10, name, sort = 'createdAt' } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);

        const friendships = await Friendship.find({
            $or: [{ user1: userId }, { user2: userId }]
        }).populate('user1', 'name email').populate('user2', 'name email');

        let friends = friendships.map(f => {
            if (f.user1._id.toString() === userId) {
                return { ...f.user2.toObject(), friendshipCreatedAt: f.createdAt };
            } else {
                return { ...f.user1.toObject(), friendshipCreatedAt: f.createdAt };
            }
        });

        if (name) {
            const regex = new RegExp(name, 'i');
            friends = friends.filter(friend => regex.test(friend.name));
        }

        if (sort) {
            const sortOrder = sort.startsWith('-') ? -1 : 1;
            const sortField = sort.startsWith('-') ? sort.substring(1) : sort;

            friends.sort((a, b) => {
                if (a[sortField] < b[sortField]) return -1 * sortOrder;
                if (a[sortField] > b[sortField]) return 1 * sortOrder;
                return 0;
            });
        }

        const total = friends.length;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedFriends = friends.slice(startIndex, endIndex);

        res.status(200).json({
            count: total,
            page,
            totalPages: Math.ceil(total / limit),
            data: paginatedFriends
        });
    } catch (err) {
        next(err);
    }
};

exports.getFriendRequests = async (req, res, next) => {
    try {
        const userId = req.user.id;
        let { page = 1, limit = 10, type = 'incoming' } = req.query;

        page = Math.max(1, parseInt(page));
        limit = Math.max(1, parseInt(limit));

        let query = {};
        if (type === 'incoming') {
            query = { receiver: userId, status: 'pending' };
        } else if (type === 'outgoing') {
            query = { sender: userId, status: 'pending' };
        } else {
            query = {
                $or: [{ sender: userId }, { receiver: userId }],
                status: 'pending'
            };
        }

        const skip = (page - 1) * limit;

        const requests = await FriendRequest.find(query)
            .populate('sender', 'name email')
            .populate('receiver', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await FriendRequest.countDocuments(query);

        res.status(200).json({
            count: total,
            page,
            totalPages: Math.ceil(total / limit),
            data: requests
        });
    } catch (err) {
        next(err);
    }
};
