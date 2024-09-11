import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,  // Trim to avoid unwanted spaces
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: [validator.isEmail, "Please enter a valid email"],
    },
    phone: {
        type: String,  // Storing phone as string
        required: true,
        unique: true,
        validate: {
            validator: function (v) {
                return /^[0-9]{10}$/.test(v);  // Custom validation for a 10-digit phone number
            },
            message: "Please enter a valid phone number",
        },
    },
    photo: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    },
    education: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ["user", "admin"],
        default: "user",
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false,  // Ensures password is not returned by default in queries
    },
    token: {
        type: String,
    },
},
    {
        timestamps: true,  // Automatically adds createdAt and updatedAt fields
    });

export const User = mongoose.model("User", userSchema);
