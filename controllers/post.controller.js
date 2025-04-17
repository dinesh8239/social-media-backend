const Post = require('../models/post.model.js')
const Comment = require('../models/comment.model.js')
const User = require('../models/user.model.js')
const asyncHandler = require('../utils/asyncHandler.js')
const ApiError = require('../utils/ApiError.js')
const ApiResponse = require('../utils/ApiResponse.js')

exports.createPost = asyncHandler(async (req, res) => {
    try {
        const { content, image } = req.body;

        if (!content && !image) {
            throw new ApiError(400, "Post must have content or image");
        }

        const post = await Post.create({
            user: req.user._id,
            content,
            image
        });

        return res.status(201).json(
            new ApiResponse(201, post, "Post created successfully")
        );
    } catch (error) {
        throw new ApiError(500, error?.message || "Something went wrong")
    }
});


exports.getAllPosts = asyncHandler(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const posts = await Post.find()
            .populate("user", "userName avatar") // Populate basic user info
            .populate("comments") // Optionally populate comments
            .sort({ createdAt: -1 }) // Latest first
            .skip(skip)
            .limit(limit);

        const total = await Post.countDocuments();

        res.status(200).json(
            new ApiResponse(200, {
                total,
                page,
                limit,
                posts
            }, "Fetched all posts")
        );

    } catch (error) {
        throw new ApiError(500, error?.message || "something went wrong")
    }
});


exports.getUserPosts = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params;


        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const posts = await Post.find({ user: userId })
            .populate("user", "userName avatar")
            .populate("comments")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        if (posts.length === 0) {
            throw new ApiError(404, "No posts found for this user");
        }


        const total = await Post.countDocuments({ user: userId });

        return res.status(200).json(
            new ApiResponse(200, {
                total,
                page,
                limit,
                posts
            }, "Fetched user's posts")
        );
    } catch (error) {
        throw new ApiError(500, error?.message || "something went wrong")
    }
});

// Like or Unlike post
exports.likeOrUnlikePost = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
        // Unlike
        post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    } else {
        // Like
        post.likes.push(userId);
    }

    await post.save();

    return res.status(200).json(
        new ApiResponse(200, post, isLiked ? "Post unliked" : "Post liked")
    );
});

