const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { response } = require('../utils/response');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return response.validationError(res, [{ field: "email", message: "Email is already registered" }]);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = (await User.create({ name, email, password: hashedPassword })).toObject();
    delete user.password; // Remove password from the response

    return response.success(res, "User registered successfully", { user }, 201);
  } catch (err) {
    return response.error(res, err.message || "Registration failed");
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return response.unauthorized(res, "Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return response.unauthorized(res, "Invalid credentials");

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    return response.success(res, "Login successful", { token });
  } catch (err) {
    return response.error(res, err.message || "Login failed");
  }
};