import mongoose from 'mongoose';
import mongoosePaginateV2 from 'mongoose-paginate-v2';
import { toJSON } from 'models/plugins';

const friendRequestSchema = mongoose.Schema(
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
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugins
friendRequestSchema.plugin(toJSON);
friendRequestSchema.plugin(mongoosePaginateV2);

const FriendRequest = mongoose.models.FriendRequest || mongoose.model('FriendRequest', friendRequestSchema);

module.exports = FriendRequest;
