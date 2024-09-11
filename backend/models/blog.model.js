import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true, // To remove unnecessary spaces
        minlength: [5, "Title should have at least 5 characters."], // Optional validation for minimum length
    },

    blogImage: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    },

    category: {
        type: String,
        required: true,
        enum: ["Devotion", "Sports", "Coding", "Entertainment", "Business", 'Other'], // You can adjust categories based on needs
        default: "Other", // Default category
    },

    about: {
        type: String,
        required: true,
        minlength: [200, "The content should contain at least 200 characters!"],
    },

    adminName: {
        type: String,
        required: true,  // Since the admin is important for each blog
        trim: true,
    },

    adminPhoto: {
        type: String, // You might want to include validation for a valid URL if needed
    },

    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User", // Referencing the User model
        required: true, // Ensure blog has a creator
    },

},
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    });

export const Blog = mongoose.model("Blog", blogSchema);
