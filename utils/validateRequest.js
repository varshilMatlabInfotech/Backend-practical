const { response } = require("../utils/response");

exports.validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) return response.validationError(res, error.details);
  next();
};
