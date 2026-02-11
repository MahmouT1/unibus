// middleware/auth-simple.js
const jwt = require('jsonwebtoken');
const { getDatabase } = require('../lib/mongodb-simple-connection');
const { ObjectId } = require('mongodb');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Get user from database
        const db = await getDatabase();
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ _id: new ObjectId(decoded.userId) });

        if (!user || user.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token or user not found'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

module.exports = authMiddleware;
