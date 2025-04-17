const mongoose = require("mongoose")
const User = require("./user.model")
const { Schema } = mongoose

const notificationSchema = new Schema({
    sender: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    receiver: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    type: {
        type: String,
        enum: ["like", "comment", "friendRequest", "message"],

    },

    message: {
        type: String
    },

    isRead: {
        type: Boolean
    }


}, { timestamps: true })


const Notification = mongoose.model("Notification", notificationSchema)

module.exports = Notification