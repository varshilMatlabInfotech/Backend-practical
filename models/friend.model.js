import mongoose from 'mongoose';
import mongoosePaginateV2 from 'mongoose-paginate-v2';
import { toJSON } from 'models/plugins';
import enumModel from 'models/enum.model';

/**
 * A FriendRequest represents the relationship between two users.
 * - `requester` is the user who sent the request.
 * - `recipient` is the user who received it.
 * - `status` tracks the lifecycle (pending -> accepted/rejected).
 * An accepted request is the source of truth for a friendship.
 */
const FriendRequestSchema = new mongoose.Schema(
  {
    /**
     * User who sent the friend request.
     */
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    /**
     * User who received the friend request.
     */
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    /**
     * Current state of the friend request.
     */
    status: {
      type: String,
      enum: Object.values(enumModel.EnumFriendRequestStatus),
      default: enumModel.EnumFriendRequestStatus.PENDING,
    },
  },
  { timestamps: true }
);

// Prevent duplicate requests for the same ordered pair of users.
FriendRequestSchema.index({ requester: 1, recipient: 1 }, { unique: true });

FriendRequestSchema.plugin(toJSON);
FriendRequestSchema.plugin(mongoosePaginateV2);

const FriendRequestModel =
  mongoose.models.FriendRequest || mongoose.model('FriendRequest', FriendRequestSchema, 'FriendRequest');
module.exports = FriendRequestModel;
