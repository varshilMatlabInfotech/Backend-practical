import {
  sendFriendRequestService,
  respondToFriendRequestService,
  getAllFriendsService,
  getIncomingRequestsService
} from '../services/friends.service.js';

// Send friend request
export const sendFriendRequest = async (req, res) => {
  try {
    const result = await sendFriendRequestService(req.user.id, req.body.toUserId);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Respond to friend request
export const respondToFriendRequest = async (req, res) => {
  try {
    const result = await respondToFriendRequestService(req.params.id, req.user.id, req.body.action);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// List all friends
export const getAllFriends = async (req, res) => {
  try {
    const result = await getAllFriendsService(req.user.id, req.query);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// List all incoming requests
export const getIncomingRequests = async (req, res) => {
  try {
    const result = await getIncomingRequestsService(req.user.id, req.query);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
