import { Server } from "socket.io";
import { Message } from "../models/Messages.js";
import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import cookie from "cookie";

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:5173",
      credentials: true,
    },
  });

  // Store online users (userId -> socketId)
  const onlineUsers = new Map();

  // ✅ Middleware to parse cookie and authenticate JWT
  io.use((socket, next) => {
    try {
      const cookies = socket.handshake.headers.cookie; // get cookies
      if (!cookies) return next(new Error("No cookie found"));

      const parsed = cookie.parse(cookies); // parse cookies
      const token = parsed.token; // get token
      if (!token) return next(new Error("Unauthorized"));

      const decoded = jwt.verify(token, process.env.JWT_SEC);
      socket.userId = decoded.id; // attach userId to socket
      next();
    } catch (err) {
      console.log("Socket auth error:", err.message);
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    onlineUsers.set(socket.userId, socket.id);

    // Join a private chat room
    socket.on("joinChat", ({ otherUserId }) => {
      const room = [socket.userId, otherUserId].sort().join("-");
      socket.join(room);
      console.log(`User ${socket.userId} joined room: ${room}`);
    });

    // Handle sending a message
    socket.on("sendMessage", async ({ receiverId, content }) => {
      if (!receiverId || !content) return;

      const message = await Message.create({
        sender: socket.userId,
        receiver: receiverId,
        content,
      });

      await message.populate("sender", "name username profilePic");
      await message.populate("receiver", "name username profilePic");

      const room = [socket.userId, receiverId].sort().join("-");
      io.to(room).emit("receiveMessage", message);

      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessageNotification", {
          sender: message.sender,
          content: message.content,
        });
      }
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(socket.userId);
      console.log(`User ${socket.userId} disconnected`);
    });
  });

  return io;
};
