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


  const onlineUsers = new Map();

  io.use((socket, next) => {
    try {
      const cookies = socket.handshake.headers.cookie;
      if (!cookies) return next(new Error("No cookie found"));

      const parsed = cookie.parse(cookies);
      const token = parsed.token;
      if (!token) return next(new Error("Unauthorized"));

      const decoded = jwt.verify(token, process.env.JWT_SEC);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      console.log("Socket auth error:", err.message);
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userId}`);

    
    onlineUsers.set(socket.userId, socket.id);

    
    io.emit("userOnline", socket.userId);

   
    socket.on("joinChat", ({ otherUserId }) => {
      const room = [socket.userId, otherUserId].sort().join("-");
      socket.join(room);
      console.log(`User ${socket.userId} joined room: ${room}`);


      Message.updateMany(
        { sender: otherUserId, receiver: socket.userId, seen: false },
        { seen: true }
      ).then(() => {
        const senderSocket = onlineUsers.get(otherUserId);
        if (senderSocket) {
          io.to(senderSocket).emit("seenUpdate", socket.userId);
        }
      });
    });

    
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

    
    socket.on("typing", ({ receiverId }) => {
      const receiverSocket = onlineUsers.get(receiverId);
      if (receiverSocket) {
        io.to(receiverSocket).emit("typing", socket.userId);
      }
    });

   
   socket.on("stopTyping", ({ receiverId }) => {
      const receiverSocket = onlineUsers.get(receiverId);
      if (receiverSocket) {
        io.to(receiverSocket).emit("stopTyping", socket.userId);
      }
    });

   
    socket.on("messageSeen", ({ senderId }) => {
      Message.updateMany(
        { sender: senderId, receiver: socket.userId, seen: false },
        { seen: true }
      ).then(() => {
        const senderSocket = onlineUsers.get(senderId);
        if (senderSocket) {
          io.to(senderSocket).emit("seenUpdate", socket.userId);
        }
      });
    });

    
    socket.on("disconnect", () => {
      onlineUsers.delete(socket.userId);
      io.emit("userOffline", socket.userId);
      console.log(`User ${socket.userId} disconnected`);
    });
  });

  return io;
};
