// routes/notificationRoutes.js
import express from "express";
import { getNotifications, markAllRead, clearAll } from "../controllers/notificationController.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

router.get("/", isAuth, getNotifications);
router.put("/mark-read", isAuth, markAllRead);
router.delete("/clear", isAuth, clearAll);

export default router;
