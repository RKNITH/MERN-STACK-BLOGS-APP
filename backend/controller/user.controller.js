import { User } from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";
import bcrypt from "bcryptjs";
import createTokenAndSaveCookies from "../jwt/AuthToken.js";

// Helper function for validation checks
const validateRequestFields = (fields, res) => {
    for (const field in fields) {
        if (!fields[field]) {
            return res.status(400).json({ message: `Missing field: ${field}` });
        }
    }
    return true;
};

export const register = async (req, res) => {
    try {
        const { photo } = req.files || {};

        // File presence and format validation
        if (!photo) {
            return res.status(400).json({ message: "User photo is required" });
        }
        const allowedFormats = ["image/jpeg", "image/png", "image/webp"];
        if (!allowedFormats.includes(photo.mimetype)) {
            return res.status(400).json({ message: "Invalid photo format. Only jpg, png, and webp are allowed" });
        }

        // Extract request body fields
        const { email, name, password, phone, education, role } = req.body;

        // Validate all required fields
        const fieldValidation = validateRequestFields(
            { email, name, password, phone, education, role, photo },
            res
        );
        if (fieldValidation !== true) return;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        // Upload photo to Cloudinary
        const cloudinaryResponse = await cloudinary.uploader.upload(photo.tempFilePath);
        if (!cloudinaryResponse || cloudinaryResponse.error) {
            throw new Error("Error uploading photo to Cloudinary");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            email,
            name,
            password: hashedPassword,
            phone,
            education,
            role,
            photo: {
                public_id: cloudinaryResponse.public_id,
                url: cloudinaryResponse.url,
            },
        });

        await newUser.save();

        // Create token and set cookies
        const token = await createTokenAndSaveCookies(newUser._id, res);

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                education: newUser.education,
                photo: newUser.photo,
                createdAt: newUser.createdAt,
            },
            token,
        });
    } catch (error) {
        console.error("Error during registration: ", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const login = async (req, res) => {
    const { email, password, role } = req.body;
    try {
        // Validate required fields
        const fieldValidation = validateRequestFields({ email, password, role }, res);
        if (fieldValidation !== true) return;

        // Find user by email
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Check role
        if (user.role !== role) {
            return res.status(400).json({ message: `Given role ${role} not found` });
        }

        // Create token and set cookies
        const token = await createTokenAndSaveCookies(user._id, res);

        return res.status(200).json({
            message: "User logged in successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token,
        });
    } catch (error) {
        console.error("Error during login: ", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const logout = (req, res) => {
    try {
        res.clearCookie("jwt", { path: "/" });
        return res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        console.error("Error during logout: ", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const getMyProfile = async (req, res) => {
    const user = req.user; // No need to `await` req.user, it's already attached
    return res.status(200).json({ user });
};

export const getAdmins = async (req, res) => {
    try {
        const admins = await User.find({ role: "admin" });
        return res.status(200).json({ admins });
    } catch (error) {
        console.error("Error fetching admins: ", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
