import Joi from 'joi';

Joi.objectId = require('joi-objectid')(Joi);

/**
 * Validation for POST /friend - Send a friend request
 */
export const sendFriendRequest = {
  body: Joi.object().keys({
    receiverId: Joi.objectId().required(),
  }),
};

/**
 * Validation for GET /friends - List accepted friends
 * Supports pagination, filtering by name, and sorting
 */
export const fetchAllFriends = {
  query: Joi.object().keys({
    page:  Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    name:  Joi.string().trim().optional(),          // filter by friend's name
    sort:  Joi.string().valid('name', 'createdAt', '-name', '-createdAt').default('-createdAt'),
  }),
};

/**
 * Validation for GET /friends-request - Incoming pending requests (paginated)
 */
export const paginatedUser = {
  query: Joi.object().keys({
    page:  Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),
};

/**
 * Validation for PUT /friends-request/:id - Accept or reject a request
 */
export const friendRequest = {
  params: Joi.object().keys({
    id: Joi.objectId().required(),
  }),
  body: Joi.object().keys({
    action: Joi.string().valid('accepted', 'rejected').required(),
  }),
};
