const FriendRequest = require('../models/friendRequest.model.js')
const User = require('../models/user.model.js')
const asyncHandler = require('../utils/asyncHandler.js')
const ApiError = require('../utils/ApiError.js')
const ApiResponse = require('../utils/ApiResponse.js')

const sendFriendRequest = asyncHandler(async (req, res) => {
    try {
        const senderId = req.user._id;
        const receiverId = req.params.receiverId;

        if (senderId.toString() === receiverId) {
            throw new ApiError(400, "You cannot send a friend request to yourself");
        }

        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (!receiver) {
            throw new ApiError(404, "User not found");
        }

        // Check if already friends
        if (receiver.friends.includes(senderId)) {
            throw new ApiError(400, "You are already friends");
        }

        // Check if a friend request already exists
        const existingRequest = await FriendRequest.findOne({
            requester: senderId,
            receiver: receiverId,
            status: "pending"
        });

        if (existingRequest) {
            throw new ApiError(400, "Friend request already sent");
        }

        // Create a new friend request
        const friendRequest = new FriendRequest({
            requester: senderId,
            receiver: receiverId,
            status: "pending"
        });

        await friendRequest.save();

        return res.status(200).json(new ApiResponse(200, friendRequest, "Friend request sent successfully"));
    }

    catch (error) {
        throw new ApiError(500, error?.message || "Something went wrong while sending the friend request")
    }
});

// Accept Friend Request
const acceptFriendRequest = asyncHandler(async (req, res) => {
    try {
        const receiverId = req.user._id;
        const { requestId } = req.params;

        const friendRequest = await FriendRequest.findById(requestId);

        if (!friendRequest || friendRequest.receiver.toString() !== receiverId.toString()) {
            throw new ApiError(404, "Friend request not found");
        }

        friendRequest.status = "accepted";
        await friendRequest.save();

        await User.findByIdAndUpdate(friendRequest.requester, {
            $addToSet: { friends: receiverId }
        });

        await User.findByIdAndUpdate(receiverId, {
            $addToSet: { friends: friendRequest.requester }
        });

        return res.status(200).json(new ApiResponse(200, friendRequest, "Friend request accepted"));

    } catch (error) {
        throw new ApiError(500, error?.message || "Something went wrong")
    }
});

// Reject Friend Request
const rejectFriendRequest = asyncHandler(async (req, res) => {
    try {
        const receiverId = req.user._id;
        const { requestId } = req.params;


        const friendRequest = await FriendRequest.findById(requestId);

        if (!friendRequest || friendRequest.receiver.toString() !== receiverId.toString()) {
            throw new ApiError(404, "Friend request not found");
        }

        friendRequest.status = "rejected";
        await friendRequest.save();

        return res.status(200).json(new ApiResponse(200, friendRequest, "Friend request rejected"));

    } catch (error) {
        throw new ApiError(500, error?.message || "Something went wrong")
    }
});

// Get all friend requests
const getAllFriendRequests = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;


        const incomingRequests = await FriendRequest.find({
            receiver: userId,
            status: "pending"
        }).populate("requester", "username email avatar");

        const outgoingRequests = await FriendRequest.find({
            requester: userId,
            status: "pending"
        }).populate("receiver", "username email avatar");

        return res.status(200).json(new ApiResponse(200, {
            incomingRequests,
            outgoingRequests
        }, "Fetched all friend requests"));

    } catch (error) {
        throw new ApiError(500, error?.message || "Something went wrong")
    }
});

// UnfriendUser
const unfriendUser = asyncHandler(async (req, res) => {
        try {
        const userId = req.user._id;
        const { friendId } = req.params;

        if (userId.toString() === friendId) {
            throw new ApiError(400, "You cannot unfriend yourself.");
        }

        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!user || !friend) {
            throw new ApiError(404, "User not found.");
        }

        // Remove each other from friends list
        await User.findByIdAndUpdate(userId, {
            $pull: { friends: friendId }
        });

        await User.findByIdAndUpdate(friendId, {
            $pull: { friends: userId }
        });

        // Optional: Remove the accepted friend request document
        await FriendRequest.findOneAndDelete({
            $or: [
                { requester: userId, receiver: friendId },
                { requester: friendId, receiver: userId }
            ],
            status: "accepted"
        });

        return res.status(200).json(new ApiResponse(200, friend, "Successfully unfriended user."))
    } catch (error) {
        throw new ApiError(500, error?.message || "Something went wrong")
    

}});

// blockedUser
const blockUser = asyncHandler(async (req, res) => {
   try {
     const userId = req.user._id;
     const { blockId } = req.params;
 
     if (userId.toString() === blockId) {
         throw new ApiError(400, "You cannot block yourself.");
     }
 
     const user = await User.findById(userId);
     const target = await User.findById(blockId);
 
     if (!user || !target) {
         throw new ApiError(404, "User not found.");
     }
 
     // Remove from friends if necessary
     await User.findByIdAndUpdate(userId, { $pull: { friends: blockId } });
     await User.findByIdAndUpdate(blockId, { $pull: { friends: userId } });
 
     // Add to blockedUsers if not already
     if (!user.blockedUsers.includes(blockId)) {
         await User.findByIdAndUpdate(userId, {
             $addToSet: { blockedUsers: blockId }
         });
     }
 
     return res.status(200).json(new ApiResponse(200, target, "User blocked successfully."));
   } catch (error) {
    throw new ApiError(500, error?.message || "Something went wrong")
   }
});

// unblockedUser
const unblockUser = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const { blockId } = req.params;
    
        await User.findByIdAndUpdate(userId, {
            $pull: { blockedUsers: blockId }
        });
    
        return res.status(200).json(new ApiResponse(200, blockId, "User unblocked successfully."));
    } catch (error) {
        throw new ApiError(500, error.message || "Something went worng")
    }
});


module.exports = {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    getAllFriendRequests,
    unfriendUser,
    blockUser,
    unblockUser
};




