import express from 'express';
import authRoutes from './user/auth/auth.route';
import friendRoutes from './friend/friend.route';

const router = express.Router();
// Authentication APIs (register, login, token refresh, etc.)
router.use('/auth', authRoutes);
// Social-network friend APIs (mounted at root so paths match the spec, e.g. GET /friends)
router.use('/', friendRoutes);
module.exports = router;
