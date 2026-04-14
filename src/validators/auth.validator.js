const Joi = require("joi");

const email = Joi.string().email().lowercase().required().messages({
  "string.email": "Invalid email format",
  "string.empty": "Email is required",
});

const password = Joi.string().min(6).required().messages({
  "string.min": "Password must be at least 6 characters",
  "string.empty": "Password is required",
});

const name = Joi.string().min(2).max(50).trim().required().messages({
  "string.empty": "Name is required",
  "string.min": "Name must be at least 2 characters",
});

const signupSchema = Joi.object({
  name,
  email,
  password,
});

const loginSchema = Joi.object({
  email,
  password,
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
  signupSchema,
  loginSchema,
  validate,
};
