const mongoose = require('mongoose');
const { toJSON } = require('./plugins'); // Assuming toJSON is a custom plugin
const mongoosePaginateV2 = require('mongoose-paginate-v2');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

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
});

// Add plugins
FaceBookUserSchema.plugin(toJSON);
FaceBookUserSchema.plugin(mongoosePaginateV2);
FaceBookUserSchema.plugin(aggregatePaginate);

// Create and export model
const FaceBookUserModel = mongoose.models.FaceBookUser || mongoose.model('FaceBookUser', FaceBookUserSchema, 'FaceBookUser');
module.exports = FaceBookUserModel;
