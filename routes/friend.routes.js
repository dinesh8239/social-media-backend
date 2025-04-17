const express = require("express");
const router = express.Router();
const { sendFriendRequest,
    rejectFriendRequest,
    getAllFriendRequests,
    acceptFriendRequest,
    unfriendUser,
    blockUser,
    unblockUser
} = require("../controllers/friend.controller");
const verifyJWT = require("../middlewares/auth.middleware");

// Send friend request
router.route("/request/:receiverId").post(verifyJWT, sendFriendRequest);
router.route("/accept/:requestId").post(verifyJWT, acceptFriendRequest);
router.route("/reject/:requestId").post(verifyJWT, rejectFriendRequest);
router.route("/requests").get(verifyJWT, getAllFriendRequests);
router.route("/unfriend/:friendId").delete(verifyJWT, unfriendUser);
router.route("/block/:blockId").post(verifyJWT, blockUser);
router.route("/unblock/:blockId").post(verifyJWT, unblockUser);






module.exports = router;
