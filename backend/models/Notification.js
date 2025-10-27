import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // who gets notified
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },    // who triggered it
  type: { type: String, enum: ["like", "follow", "comment"], required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" }, // only for like/comment
  message: { type: String },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

export const Notification = mongoose.model("Notification", notificationSchema);
