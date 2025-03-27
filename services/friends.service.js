import { Friends } from "models";
import { EnumFriendRequest } from "../models/enum.model";

export async function findExistingRequest(receiver, requester) {
  const existingFriendRequest = await Friends.findOne({ receiver, requester });

  return existingFriendRequest;
}

export async function createFriendRequest(body) {
  const friendRequest = await Friends.create(body);

  return friendRequest;
}

export async function findFriendRequestById(id) {
  const friendRequest = await Friends.findById(id);

  return friendRequest;
}

export async function acknowledgeRequest(id, status) {
  const acknowledgedRequest = await Friends.update({ _id: id }, { status });

  return acknowledgedRequest;
}

export async function findFriends(requesterId, pagination) {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  const friends = await Friends.find({
    requester: requesterId,
    status: EnumFriendRequest.ACCEPTED,
  })
    .populate("receiver", "name email")
    .skip(skip)
    .limit(limit);

  return friends;
}

export async function findFriendRequests(receiverId, pagination) {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  const friends = await Friends.find({
    receiver: receiverId,
    status: EnumFriendRequest.PENDING,
  })
    .populate("requester", "name email")
    .skip(skip)
    .limit(limit);

  return friends;
}
