import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  caption: {
    type: String,
    trim: true,
  },

  hashtags: [
    {
      type: String,
      lowercase: true,
    },
  ],

  files: [ // supports multiple images/videos
    {
      id: String,
      url: String,
      type: { type: String, enum: ["image", "video"], default: "image" },
    },
  ],

  type: {
    type: String,
    required: true,
    enum: ["post", "reel"],
    default: "post",
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      name: { type: String, required: true },
      comment: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },

  isDeleted: {
    type: Boolean,
    default: false,
  },
});

export const Post = mongoose.model("Post", postSchema);
