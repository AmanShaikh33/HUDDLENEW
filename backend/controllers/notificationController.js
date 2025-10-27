// controllers/notificationController.js
import { Notification } from "../models/Notification.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate("sender", "username profilePic")
      .sort({ createdAt: -1 });

    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const markAllRead = async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id }, { read: true });
  res.json({ message: "All notifications marked as read" });
};

export const clearAll = async (req, res) => {
  await Notification.deleteMany({ recipient: req.user._id });
  res.json({ message: "All notifications cleared" });
};
