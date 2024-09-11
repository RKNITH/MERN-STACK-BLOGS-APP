import { User } from '../models/user.model.js';
import jwt from 'jsonwebtoken';

// AUTHENTICATION
export const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.jwt; // Correct way to access cookies
        console.log('Middleware : ', token);

        if (!token) {
            return res.status(401).json({ error: 'No token provided, user not authenticated' });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // Find the user by ID
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Attach user to request object
        req.user = user;
        next();

    } catch (error) {
        console.error("Error during authentication: ", error);

        // Token-specific error handling
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired, please log in again' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token, user not authenticated' });
        } else {
            return res.status(500).json({ error: 'Internal server error during authentication' });
        }
    }
};

// AUTHORIZATION (hasRole instead of isAdmin for flexibility)
export const isAdmin = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: `User role "${req.user.role}" not authorized to access this resource` });
        }
        next();
    };
};
