import express from 'express';
import auth from 'middlewares/auth';
import validate from 'middlewares/validate';
import { authValidation } from 'validations/user';
import { authController } from 'controllers/user';

const router = express.Router();

// Register a new user
router.post('/register', validate(authValidation.register), authController.register);

// Login with email and password
router.post('/login', validate(authValidation.login), authController.login);

// Get logged-in user's profile
router.get('/me', auth(), authController.userInfo);

// Update logged-in user's profile
router.put('/me', auth(), authController.updateUserInfo);

// Get new access/refresh tokens using a refresh token
router.post(
  '/refresh-tokens',
  validate(authValidation.refreshTokens),
  authController.refreshTokens
);

// Logout and invalidate refresh token
router.post('/logout', auth(), validate(authValidation.logout), authController.logout);

module.exports = router;
