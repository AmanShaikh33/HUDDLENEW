import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true }, // new
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: { type: String, required: true, enum: ["male", "female"] },
    bio: { type: String, default: "" }, // new
    profilePic: { id: String, url: String },
    coverPhoto: { id: String, url: String }, // new
    isVerified: { type: Boolean, default: false }, // optional
    lastLogin: { type: Date }, // optional
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followings: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    badges: {
      firstPost: { type: Boolean, default: false },
      oneFollower: { type: Boolean, default: false },
      fiveFollowers: { type: Boolean, default: false },
      chatter: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
