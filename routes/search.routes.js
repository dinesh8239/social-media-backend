const express = require("express")

const router = express.Router()

const {searchUsers, searchComments, searchPosts} = require("../controllers/search.controller.js")

const verifyJWT = require("../middlewares/auth.middleware.js")

router.route('/users').get(verifyJWT, searchUsers)
router.route('/comments').get(verifyJWT, searchComments);
router.route('/posts').get(verifyJWT, searchPosts)



module.exports = router;