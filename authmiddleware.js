const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization'); 

    if (!token || !token.startsWith("Bearer ")) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const extractedToken = token.split(" ")[1];
        const decoded = jwt.verify(extractedToken, process.env.JWT_SECRET);
        
        req.user = { userId: decoded.userId }; 

        next();
    } catch (error) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

module.exports = authMiddleware;
