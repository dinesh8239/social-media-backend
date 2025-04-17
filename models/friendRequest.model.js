const mongoose = require("mongoose")
const { Schema } = mongoose

const friendRequestSchema = new Schema({
    requester: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    receiver: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],

    }
}, { timestamps: true })


const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema)

module.exports = FriendRequest