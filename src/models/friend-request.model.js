const mongoose = require("mongoose");
const { FRIEND_REQUEST_STATUS } = require("../constants/enum");
const friendRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(FRIEND_REQUEST_STATUS),
      default: FRIEND_REQUEST_STATUS.PENDING,
    },
  },
  {
    timestamps: true,
  },
);

friendRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });

friendRequestSchema.pre("save", async function () {
  if (this.sender.toString() === this.receiver.toString()) {
    throw new Error("You cannot send friend request to yourself");
  }
});

module.exports = mongoose.model("FriendRequest", friendRequestSchema);
