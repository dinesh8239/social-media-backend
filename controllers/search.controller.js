const User = require("../models/user.model.js");
const Comment = require("../models/comment.model.js")
const Post = require("../models/post.model.js")
const asyncHandler = require("../utils/asyncHandler.js");
const ApiResponse = require("../utils/ApiResponse.js");
const ApiError = require("../utils/ApiError.js");

// Search users by username or email
exports.searchUsers = asyncHandler(async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            throw new ApiError(400, "Search query is required");
        }

        const users = await User.find({
            $or: [
                { userName: { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } }
            ]
        }).select("userName email avatar");

        return res.status(200).json(
            new ApiResponse(200, users, "Search results")
        )
    } catch (error) {
        throw new ApiError(500, error?.message || "Something went wrong")
    };
});

exports.searchComments = asyncHandler(async (req, res) => {
    try {
      const { query } = req.query;
  
      if (!query) {
        throw new ApiError(400, "Please provide a search query");
      }
  
      const comments = await Comment.find({
        content: { $regex: query, $options: "i" },
      })
        .populate("user", "userName avatar")
        .populate("post", "content image") // Optional: info about the post
        .sort({ createdAt: -1 });
  
      return res.status(200).json(
        new ApiResponse(200, comments, "Search comment results")
      );
    } catch (error) {
      throw new ApiError(500, error?.message || "Something went wrong");
    }
  });

exports.searchPosts = asyncHandler(async (req, res) => {
    try {
      const { query } = req.query;
  
      if (!query) {
        throw new ApiError(400, "Please provide a search query");
      }
  
      const posts = await Post.find({
        $or: [
          { content: { $regex: query, $options: "i" } },
          { location: { $regex: query, $options: "i" } },
          { tags: { $regex: query, $options: "i" } }
        ]
      })
        .populate("user", "userName avatar email")
        .populate({
          path: "comments",
          populate: { path: "user", select: "userName avatar" }
        })
        .sort({ createdAt: -1 });
  
      return res.status(200).json(
        new ApiResponse(200, posts, "Search results")
      );
    } catch (error) {
      throw new ApiError(500, error?.message || "Something went wrong");
    }
  });