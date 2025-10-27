import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  getChatHistory,
  sendMessage,
  markMessagesAsRead,
  getUnreadCounts
} from "../controllers/messageControllers.js";

const router = express.Router();

// Get chat history with another user
router.get("/history/:userId", isAuth, getChatHistory);

// Send a message (backup, real-time via WebSockets)
router.post("/send", isAuth, sendMessage);

// Mark messages as read
router.put("/read/:userId", isAuth, markMessagesAsRead);

router.get("/unread-count", isAuth, getUnreadCounts);

export default router;