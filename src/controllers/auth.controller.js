const {
  signupSchema,
  loginSchema,
  validate,
} = require("../validators/auth.validator");
const logger = require("../utils/logger");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const register = async (req, res, next) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: "Inputs are required",
      });
    }
    const errors = validate(signupSchema, req.body);
    if (errors) {
      return res.status(400).json({
        success: false,
        message: errors,
      });
    }

    let { name, email, password } = req.body;
    email = email.toLowerCase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    logger.info("User registered", { email });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: "Inputs are required",
      });
    }
    const errors = validate(loginSchema, req.body);
    if (errors) {
      return res.status(400).json({
        success: false,
        message: errors,
      });
    }

    let { email, password } = req.body;
    email = email.toLowerCase();

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    logger.info("User logged in", { email });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };
