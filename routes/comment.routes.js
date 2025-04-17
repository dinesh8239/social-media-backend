const express = require("express")

const router = express.Router()

const { addComment,
    getPostComments,
    likeComment,
    unlikeComment,
    replyToComment,
    deleteComment,
    updateComment,
    toggleLikeComment,
    getReplies
} = require("../controllers/comment.controller")

const verifyJWT = require("../middlewares/auth.middleware")

router.route("/add/:postId").post(verifyJWT, addComment);
router.route("/:postId").get(verifyJWT, getPostComments);
router.route("/:commentId/like").post(verifyJWT, likeComment);
router.route("/:commentId/unlike").post(verifyJWT, unlikeComment);
router.route("/:commentId/reply").post(verifyJWT, replyToComment);
router.route("/:commentId").delete(verifyJWT, deleteComment)
router.route("/:commentId").put(verifyJWT, updateComment)
router.route("/:commentId/like").put(verifyJWT, toggleLikeComment)
router.route("/:commentId/replies").get(verifyJWT, getReplies);




module.exports = router