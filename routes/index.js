import express from 'express';
import authRoutes from './user/auth/auth.route';
import userRoutes from './user/user/user.route';

const router = express.Router();
router.use('/user', userRoutes);
router.use('/auth', authRoutes);
module.exports = router;
