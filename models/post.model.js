const mongoose = require("mongoose");
const { Schema } = mongoose;

const postSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  content: {
    type: String,
    trim: true,
  },

  image: {
    type: String, // Cloudinary URL if uploaded
  },

  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  ],

  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    }
  ],

  visibility: {
    type: String,
    enum: ["public", "friends", "private"],
    default: "public",
  },

  location: {
    type: String
  },

  tags: [
    {
      type: String,
      trim: true
    }
  ]

}, { timestamps: true });

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
