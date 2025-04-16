const { response } = require("../utils/response");

exports.validateRequest = (schema) => (req, res, next) => {
  const options = {
    abortEarly: false, // return all errors
    allowUnknown: false, // don't allow unknown fields
    stripUnknown: true, // remove unknown fields
  };

  const { error, value } = schema.validate(req.body, options);

  if (error) {
    const formattedErrors = error.details.map((err) => ({
      field: err.context.label,
      message: err.message.replace(/['"]/g, ""),
    }));
    return response.validationError(res, formattedErrors);
  }

  req.body = value; // update req.body with validated and sanitized data
  next();
};
