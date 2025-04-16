const Joi = require("joi");

exports.sendFriendRequestValidator = Joi.object({
  to: Joi.string().length(24).required().label("Recipient ID"),
});

exports.respondFriendRequestValidator = Joi.object({
  action: Joi.string().valid("accept", "reject").required().label("Action"),
});
