import mongoose, { Schema } from "mongoose";
import toJSON from "./plugins/toJSON.plugin";
import enumModel from "models/enum.model";

const friendsSchema = new Schema({
  requester: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "User",
  },
  receiver: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "User",
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(enumModel.EnumFriendRequest),
    default: enumModel.EnumFriendRequest.PENDING,
  },
});

friendsSchema.plugin(toJSON);

const FriendsModel = mongoose.model("Friends", friendsSchema);

module.exports = FriendsModel;
