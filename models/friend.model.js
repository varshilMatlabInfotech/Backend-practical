import mongoose, { Schema } from 'mongoose';
import toJSON from './plugins/toJSON.plugin';

const FRIEND_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
};

const friendSchema = new Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(FRIEND_STATUS),
      default: FRIEND_STATUS.PENDING,
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate friend requests between same two users
friendSchema.index({ requester: 1, recipient: 1 }, { unique: true });

friendSchema.plugin(toJSON);

export const Friend = mongoose.model('Friend', friendSchema);
export { FRIEND_STATUS };
