import TryCatch from "../utils/Trycatch.js";
import { Message } from "../models/Messages.js";
import { User } from "../models/userModel.js";

// ------------------- GET CHAT HISTORY BETWEEN TWO USERS -------------------
export const getChatHistory = TryCatch(async (req, res) => {
  const { userId } = req.params; // The other user's ID
  const currentUserId = req.user._id;

  // Ensure the other user exists
  const otherUser = await User.findById(userId);
  if (!otherUser) {
    return res.status(404).json({ message: "User not found" });
  }

  // Fetch messages between current user and the other user (bidirectional)
  const messages = await Message.find({
    $or: [
      { sender: currentUserId, receiver: userId },
      { sender: userId, receiver: currentUserId },
    ],
  })
    .sort({ timestamp: 1 }) // Oldest first
    .populate("sender", "name username profilePic")
    .populate("receiver", "name username profilePic");

  res.json({ messages });
});

// ------------------- SEND MESSAGE (VIA API, FOR BACKUP/TESTING) -------------------
// Note: Real-time sending is handled via WebSockets (see socket.js below). This is for edge cases.
export const sendMessage = TryCatch(async (req, res) => {
  const { receiverId, content } = req.body;
  const senderId = req.user._id;

  if (!receiverId || !content) {
    return res.status(400).json({ message: "Receiver and content are required" });
  }

  // Ensure receiver exists
  const receiver = await User.findById(receiverId);
  if (!receiver) {
    return res.status(404).json({ message: "Receiver not found" });
  }

  // Create and save message
  const message = await Message.create({
    sender: senderId,
    receiver: receiverId,
    content,
  });

  res.status(201).json({ message: "Message sent", data: message });
});

// ------------------- MARK MESSAGES AS READ -------------------
export const markMessagesAsRead = TryCatch(async (req, res) => {
  const { userId } = req.params; // The sender whose messages to mark as read
  const currentUserId = req.user._id;

  await Message.updateMany(
    { sender: userId, receiver: currentUserId, isRead: false },
    { isRead: true }
  );

  res.json({ message: "Messages marked as read" });
});

export const getUnreadCounts = TryCatch(async (req, res) => {
  const currentUserId = req.user._id;

  // Aggregate unread messages grouped by sender
  const counts = await Message.aggregate([
    { $match: { receiver: currentUserId, isRead: false } },
    { $group: { _id: "$sender", count: { $sum: 1 } } }
  ]);

  // Format: [{ userId: '...', count: 2 }]
  const result = counts.map(c => ({ userId: c._id.toString(), count: c.count }));
  res.json(result);
});