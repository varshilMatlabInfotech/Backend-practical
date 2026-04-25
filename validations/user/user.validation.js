/**
 * Validation schemas for friend-related endpoints
 */
import Joi from 'joi';

Joi.objectId = require('joi-objectid')(Joi);

export const sendFriendRequest = {
  body: Joi.object().keys({
    recipientId: Joi.objectId().required(),
  }),
};

export const fetchAllFriends = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().allow('').optional(),
    sortBy: Joi.string().valid('createdAt', 'name').default('createdAt'),
    order: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

export const paginatedUser = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),
};

export const friendRequest = {
  params: Joi.object().keys({
    id: Joi.objectId().required(),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid('accepted', 'rejected').required(),
  }),
};
