/**
 * Joi validation schemas for the friend APIs.
 * Each schema validates the relevant request segment (body/params/query).
 */
import Joi from 'joi';

Joi.objectId = require('joi-objectid')(Joi);

/**
 * POST /friend - send a friend request.
 */
export const sendFriendRequest = {
  body: Joi.object().keys({
    recipientId: Joi.objectId().required(),
  }),
};

/**
 * PUT /friends-request/:id - accept or reject a friend request.
 */
export const respondFriendRequest = {
  params: Joi.object().keys({
    id: Joi.objectId().required(),
  }),
  body: Joi.object().keys({
    action: Joi.string().valid('accept', 'reject').required(),
  }),
};

/**
 * GET /friends-request - list incoming requests with pagination.
 */
export const getIncomingFriendRequests = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1),
    sortBy: Joi.string(),
  }),
};
