const Comment = require("../models/comment.model.js")
const Post = require("../models/post.model.js")
const asyncHandler = require("../utils/asyncHandler.js")
const ApiError = require("../utils/ApiError.js")
const ApiResponse = require("../utils/ApiResponse.js")

// Add a comment to a post
exports.addComment = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "Comment content is required");
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const comment = await Comment.create({
        user: req.user._id,
        post: postId,
        content
    });

    return res.status(201).json(
        new ApiResponse(201, comment, "Comment added successfully")
    );
});

// Get all comments for a post
exports.getPostComments = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    const comments = await Comment.find({ post: postId })
        .populate("user", "userName avatar")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, comments, "Comments fetched successfully")
    );
});

// Like a Comment
exports.likeComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.likes.includes(userId)) {
        throw new ApiError(400, "You have already liked this comment");
    }

    comment.likes.push(userId);
    await comment.save();

    res.status(200).json(
        new ApiResponse(200, comment, "Comment liked successfully")
    );
});

// Unlike a Comment
exports.unlikeComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (!comment.likes.includes(userId)) {
        throw new ApiError(400, "You haven't liked this comment yet");
    }

    comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
    await comment.save();

    res.status(200).json(
        new ApiResponse(200, comment, "Comment unliked successfully")
    );
});

exports.replyToComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params; // parent comment
    const { content } = req.body;
    const userId = req.user._id;

    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
        throw new ApiError(404, "Parent comment not found");
    }

    const reply = await Comment.create({
        user: userId,
        post: parentComment.post,
        content,
        parentComment: commentId
    });

    return res.status(201).json(
        new ApiResponse(201, reply, "Reply added successfully")
    );
});

exports.deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // Only comment owner can delete it
    if (comment.user.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to delete this comment");
    }

    // Delete the comment
   const data =  await Comment.findByIdAndDelete(commentId);

    // Optionally, also delete replies to this comment
    await Comment.deleteMany({ parentComment: commentId });

    return res.status(200).json(
        new ApiResponse(200, data, "Comment deleted successfully")
    );

})

exports.updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;
  
    const comment = await Comment.findById(commentId);
  
    if (!comment) {
      throw new ApiError(404, "Comment not found");
    }
  
    if (comment.user.toString() !== userId.toString()) {
      throw new ApiError(403, "You are not authorized to edit this comment");
    }
  
    if (!content) {
      throw new ApiError(400, "Updated content is required");
    }
  
    comment.content = content;
    await comment.save();
  
    return res.status(200).json(
      new ApiResponse(200, comment, "Comment updated successfully")
    );
  });

  exports.toggleLikeComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;
  
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new ApiError(404, "Comment not found");
    }
  
    const alreadyLiked = comment.likes.includes(userId);
  
    if (alreadyLiked) {
      // Unlike
      comment.likes.pull(userId);
      await comment.save();
      return res.status(200).json(
        new ApiResponse(200, comment, "Comment unliked successfully")
      );
    } else {
      // Like
      comment.likes.push(userId);
      await comment.save();
      return res.status(200).json(
        new ApiResponse(200, comment, "Comment liked successfully")
      );
    }
  });
  
  exports.getReplies = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
  
    const replies = await Comment.find({ parentComment: commentId })
      .populate("user", "userName avatar")
      .sort({ createdAt: -1 });      
  
    return res.status(200).json(
      new ApiResponse(200, replies, "Replies fetched successfully")
    );
  });
  
  


