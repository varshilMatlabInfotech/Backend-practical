import Joi from 'joi';

// For sending friend request
export const sendRequestSchema = Joi.object({
  toUserId: Joi.string().required(),
});

// For responding to friend request
export const respondRequestSchema = Joi.object({
  action: Joi.string().valid('accept', 'reject').required(),
});
