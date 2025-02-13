const express = require('express');
const router = express.Router();
const { register, login,getFriendCount } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
 // Registration endpoint
router.post('/register', register);

// Login endpoint
router.post('/login', login);

// Protect the route using the auth middleware

router.get('/friends/count', authMiddleware, getFriendCount);


module.exports = router;
