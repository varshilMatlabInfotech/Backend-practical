import mongoose from 'mongoose';
import { toJSON } from 'models/plugins'; // Ensure this path and plugin are correct
import mongoosePaginateV2 from 'mongoose-paginate-v2';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

// Define a reusable sub-schema for lists of users
const UserRefSchema = {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
};

const FaceBookUserSchema = new mongoose.Schema({
    /**
     * ID of the User
     */
    user: UserRefSchema,

    /**
     * List of friend requests received
     */
    friendRequestlist: [{
        reqUsers: UserRefSchema
    }],

    /**
     * List of friends
     */
    userFriendList: [{
        friendOfUsers: UserRefSchema
    }],

    /**
     * List of sent friend requests
     */
    sendRequestList: [{
        userSendRequests: UserRefSchema
    }]
}, { timestamps: true });

// Add plugins
FaceBookUserSchema.plugin(toJSON);
FaceBookUserSchema.plugin(mongoosePaginateV2);
FaceBookUserSchema.plugin(aggregatePaginate);

// Create and export model
const FaceBookUserModel = mongoose.models.FaceBookUser || mongoose.model('FaceBookUser', FaceBookUserSchema, 'FaceBookUser');
module.exports =  FaceBookUserModel; // Use export default for ES modules
