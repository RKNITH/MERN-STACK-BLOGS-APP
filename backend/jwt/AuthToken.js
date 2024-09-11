import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

const createTokenAndSaveCookies = async (userId, res) => {
    try {
        const token = jwt.sign({ userId }, process.env.JWT_SECRET_KEY, {
            expiresIn: '30d',
        });

        // Set cookie with security settings
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Ensure secure cookies in production
            sameSite: 'lax', // Changed to valid option ('lax' is generally recommended)
            path: '/', // Accessible across your entire site
        });

        // Optionally store the token in the database
        await User.findByIdAndUpdate(userId, { token });

        return token;
    } catch (error) {
        console.error('Error creating token or setting cookie:', error);
        throw new Error('Unable to create token or set cookie.');
    }
};

export default createTokenAndSaveCookies;
