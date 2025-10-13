import express from "express";
import cors from 'cors';
import dotenv from "dotenv";
import { connectDb } from "./database/db.js";
import cloudinary from "cloudinary";
import cookieParser from "cookie-parser";
import { Chat } from "./models/ChatModel.js";
import { isAuth } from "./middlewares/isAuth.js";
import { User } from "./models/userModel.js";
import { app, server } from "./socket/socket.js";
import path from "path";
import axios from 'axios';

dotenv.config();

// Remove or guard local-only reload ping — NOT for production
// const url = `http://localhost:7000`;
// const interval = 30000;

// function reloadWebsite() {
//   axios
//     .get(url)
//     .then((response) => {
//       console.log(
//         `Reloaded at ${new Date().toISOString()}: Status Code ${response.status}`
//       );
//     })
//     .catch((error) => {
//       console.error(
//         `Error reloading at ${new Date().toISOString()}:`,
//         error.message
//       );
//     });
// }

// if (process.env.NODE_ENV !== "production") {
//   setInterval(reloadWebsite, interval);
// }

cloudinary.v2.config({
  cloud_name: process.env.Cloudinary_Cloud_Name,
  api_key: process.env.Cloudinary_Api,
  api_secret: process.env.Cloudinary_Secret,
});

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    maxAge: 14400,
  })
);

// Routes - inline
app.get("/api/messages/chats", isAuth, async (req, res) => {
  try {
    const chats = await Chat.find({ users: req.user._id }).populate({
      path: "users",
      select: "name profilePic",
    });

    chats.forEach((e) => {
      e.users = e.users.filter(
        (user) => user._id.toString() !== req.user._id.toString()
      );
    });

    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/user/all", isAuth, async (req, res) => {
  try {
    const search = req.query.search || "";
    const users = await User.find({
      name: { $regex: search, $options: "i" },
      _id: { $ne: req.user._id },
    }).select("-password");

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Imported routes
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);
app.use("/api/messages", messageRoutes);

// Serve frontend static files
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "/frontend/dist")));

// ✅ Health check route for Render
app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

// Catch-all to serve index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

// ✅ Correct: use Render's dynamic PORT
const port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
  connectDb();
});
