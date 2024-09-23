import ApiError from 'utils/ApiError';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import { FaceBookUser } from 'models';
import { userService } from 'services';

export async function createFaceBookUser(email, options = {}) {
    try {
        const user = await userService.getOne({ email });
        const query = { user: mongoose.Types.ObjectId(user._id) };
        const faceBookUser = await FaceBookUser.findOne(query, options.projection, options);
        if (!faceBookUser && user) {
            let data = {
                user: user._id,
            }
            await FaceBookUser.create(data)
        }
        return
    } catch (error) {
        console.error("Error fetching create faceBook:", error);
        throw error;
    }
}

export async function getFaceBookUserById(id, options = {}) {
    try {
        const faceBookUser = await FaceBookUser.findById(id, options.projection, options);
        if (!faceBookUser) {
            throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
        }
        return faceBookUser;
    } catch (error) {
        console.error("Error fetching Facebook user by ID:", error);
        throw error;
    }
}

export async function getFaceBookUserOne(query, options = {}) {
    try {
        const faceBookUser = await FaceBookUser.findOne(query, options.projection, options);
        if (!faceBookUser) {
            throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
        }
        return faceBookUser;
    } catch (error) {
        console.error("Error fetching Facebook user:", error);
        throw error;
    }
}

export async function getUserFriendListWithPagination(filter, options = {}) {
    try {
        const faceBookUser = await FaceBookUser.paginate(filter, options);
        return faceBookUser;
    } catch (error) {
        console.error("Error fetching friend list with pagination:", error);
        throw error;
    }
}

export async function updateFacebookUser(filter, body, options = {}) {
    try {
        console.log("-----filter-------", filter);
        console.log("-----body-------", body);
        const faceBookUser = await FaceBookUser.findOneAndUpdate(filter, body, options);
        if (!faceBookUser) {
            throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
        }
        return faceBookUser;
    } catch (error) {
        console.error("Error updating Facebook user:", error);
        throw error;
    }
}

export async function faceBookUserAggregatePaginate(paginate) {
    try {
        console.log("----------paginate",JSON.stringify(paginate))
        const options = {
            page: paginate?.offset || 1,
            limit: paginate?.limit || 100,
        };

        // Create the aggregation pipeline once
        const aggregate = FaceBookUser.aggregate(paginate?.query || []);

        // Use aggregatePaginate with the aggregation pipeline and options
        const faceBookUser = await FaceBookUser.aggregatePaginate(aggregate, options);

        return faceBookUser;
    } catch (error) {
        console.error("Error with Facebook user aggregate pagination:", error);
        throw error;
    }
}
