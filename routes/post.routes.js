const express = require("express")
const router = express.Router()
const { createPost, getAllPosts, getUserPosts, likeOrUnlikePost } = require("../controllers/post.controller.js")

const verifyJWT = require("../middlewares/auth.middleware.js")

router.route('/create').post(verifyJWT, createPost)
router.route('/').get(verifyJWT, getAllPosts)
router.route('/user/:userId').get(verifyJWT, getUserPosts); 
router.route('/:postId/like').post(verifyJWT, likeOrUnlikePost);




module.exports = router