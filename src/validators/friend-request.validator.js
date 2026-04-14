const Joi = require("joi");

const sendRequestSchema = Joi.object({
  receiverId: Joi.string().length(24).required().messages({
    "string.empty": "Receiver ID is required",
    "string.length": "Invalid receiver ID",
  }),
});

const respondRequestSchema = Joi.object({
  action: Joi.string().valid("ACCEPT", "REJECT").required().messages({
    "any.only": "Action must be ACCEPT or REJECT",
    "string.empty": "Action is required",
  }),
});

const validate = (schema, data) => {
  const { error } = schema.validate(data, {
    abortEarly: false,
  });

  if (error) {
    return error.details.map((err) => err.message);
  }

  return null;
};

module.exports = {
  sendRequestSchema,
  respondRequestSchema,
  validate,
};
