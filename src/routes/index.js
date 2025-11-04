import express from 'express';
import authRoutes from './auth.routes.js';
import friendsRoutes from './friends.routes.js';

const router = express.Router();

router.use('/', authRoutes);
router.use('/', friendsRoutes);

export default router;
