import mongoose from 'mongoose';
import mongoosePaginateV2 from 'mongoose-paginate-v2';
import toJSON from './plugins/toJSON.plugin';

/**
 * Possible statuses for a friend request
 */
export const FriendRequestStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
};

/**
 * Friend schema
 * sender   - the user who sent the request
 * receiver - the user who received the request
 * status   - current state of the request
 */
const friendSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(FriendRequestStatus),
      default: FriendRequestStatus.PENDING,
    },
  },
  { timestamps: true }
);

// Prevent duplicate friend requests between the same two users
friendSchema.index({ sender: 1, receiver: 1 }, { unique: true });

friendSchema.plugin(toJSON);
friendSchema.plugin(mongoosePaginateV2);

export const Friend = mongoose.model('Friend', friendSchema);
