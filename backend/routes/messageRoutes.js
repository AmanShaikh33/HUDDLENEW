import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  getChatHistory,sendMessage,
  markMessagesAsRead,
  getUnreadCounts
} from "../controllers/messageControllers.js";

const router = express.Router();


router.get("/history/:userId", isAuth, getChatHistory);


router.post("/send", isAuth, sendMessage);


router.put("/read/:userId", isAuth, markMessagesAsRead);

router.get("/unread-count", isAuth, getUnreadCounts);

export default router;