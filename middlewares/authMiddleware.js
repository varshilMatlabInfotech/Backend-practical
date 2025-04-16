const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { response } = require('../utils/response');

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return response.unauthorized(res, "Unauthorized");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    response.unauthorized(res, "Invalid Token");
  }
};
