import mongoose from "mongoose";
import { Blog } from "../models/blog.model.js";
import { v2 as cloudinary } from "cloudinary";

// Helper to upload images to Cloudinary
const uploadImageToCloudinary = async (file) => {
    try {
        const response = await cloudinary.uploader.upload(file.tempFilePath);
        return response;
    } catch (error) {
        console.log("Cloudinary Error:", error);
        throw new Error("Error uploading image");
    }
};

// Helper to check if an ID is a valid MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Helper to validate file input
const validateFileInput = (file, allowedFormats) => {
    if (!file || Object.keys(file).length === 0) {
        throw new Error("File is required");
    }
    if (!allowedFormats.includes(file.mimetype)) {
        throw new Error(`Invalid format. Allowed formats: ${allowedFormats.join(", ")}`);
    }
};

// CREATE BLOG
export const createBlog = async (req, res) => {
    try {
        const { blogImage } = req.files;
        const allowedFormats = ["image/jpeg", "image/png", "image/webp"];

        // Validate file input
        validateFileInput(blogImage, allowedFormats);

        const { title, category, about } = req.body;
        if (!title || !category || !about) {
            return res.status(400).json({ message: "Title, category, and about are required fields" });
        }

        const adminName = req.user?.name;
        const adminPhoto = req.user?.photo?.url;
        const createdBy = req.user?._id;

        // Upload blog image to cloudinary
        const cloudinaryResponse = await uploadImageToCloudinary(blogImage);

        // Create new blog
        const blogData = {
            title,
            about,
            category,
            adminName,
            adminPhoto,
            createdBy,
            blogImage: {
                public_id: cloudinaryResponse.public_id,
                url: cloudinaryResponse.url,
            },
        };

        const blog = await Blog.create(blogData);
        return res.status(201).json({ message: "Blog created successfully", blog });

    } catch (error) {
        console.error("Create Blog Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// DELETE BLOG
export const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate blog id
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid Blog ID" });
        }

        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        await blog.deleteOne();
        return res.status(200).json({ message: "Blog deleted successfully" });

    } catch (error) {
        console.error("Delete Blog Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// GET ALL BLOGS
export const getAllBlogs = async (req, res) => {
    try {
        const allBlogs = await Blog.find();
        return res.status(200).json(allBlogs);
    } catch (error) {
        console.error("Get All Blogs Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// GET SINGLE BLOG
export const getSingleBlogs = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate blog id
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid Blog ID" });
        }

        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        return res.status(200).json(blog);

    } catch (error) {
        console.error("Get Single Blog Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// GET MY BLOGS
export const getMyBlogs = async (req, res) => {
    try {
        const createdBy = req.user._id;
        const myBlogs = await Blog.find({ createdBy });
        return res.status(200).json(myBlogs);
    } catch (error) {
        console.error("Get My Blogs Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// UPDATE BLOG
export const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate blog id
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid Blog ID" });
        }

        const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedBlog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        return res.status(200).json(updatedBlog);

    } catch (error) {
        console.error("Update Blog Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
