import mongoose, { Schema } from "mongoose";
import toJSON from "./plugins/toJSON.plugin";

const friendSchema = new Schema({
    fetchAllFriends:{
        type: String,
        id: mongoose.Types.ObjectId,
        required: true,
        unique: true

    },
    sendFriendRequest:{
        type: String,
        id: mongoose.Types.ObjectId,
        required: true,
        unique: true
    },
    friendRequest:{
        type: String,
        id: mongoose.Types.ObjectId,
        required: true,
        unique: true,
        enum: ["accept" || "reject"],
    },
    getFriendRequestWithPagination:{
        id: mongoose.Types.ObjectId,
        type:String,
        required: true,
        unique: true
    },
},{timestamps: true})
friendSchema.plugin(toJSON)

export const Friend = mongoose.model("Friend", friendSchema)