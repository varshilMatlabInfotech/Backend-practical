import mongoose from 'mongoose';

const FriendShipSchema = new mongoose.Schema({
  requester: {
    type: String,
    required: true,
  },
  recipient: {
    type: String,
    required: true,
  },
  accept: {
    type: Boolean,
    default: false,
    required: true,
  },
});

const FriendshipModel =
  mongoose.models.Friendship ||
  mongoose.model('Friendship', FriendShipSchema, 'Friendship');
module.exports = FriendshipModel;
