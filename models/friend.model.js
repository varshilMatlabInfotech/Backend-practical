import mongoose, { Schema } from "mongoose";
import toJSON from "./plugins/toJSON.plugin";

const friendSchema = new Schema(
  {
    fetchAllFriends: {
      type: String,
      _Id: mongoose.Types.ObjectId,
      required: true,
      unique: true,
    },
    sendFriendRequest: {
      type: String,
      _Id: mongoose.Types.ObjectId,
      required: true,
      unique: true,
    },
    friendRequest: {
      type: String,
      _Id: mongoose.Types.ObjectId,
      required: true,
      unique: true,
      enum: ["accept" || "reject"],
    },
    getFriendRequestWithPagination: {
      _Id: mongoose.Types.ObjectId,
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);
friendSchema.plugin(toJSON);

export const Friend =
  mongoose.models.Friend || mongoose.model("Friend", friendSchema);
