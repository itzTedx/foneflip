import redis from "@ziron/redis";

import "dotenv/config";

import { createServer } from "http";
import express from "express";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  // Optional: join room based on userId (if you have auth)
  socket.on("join", (userId: string) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined their room`);
  });

  socket.on("disconnect", () => {
    console.log("🔌 Socket disconnected:", socket.id);
  });
});

// Redis pub/sub → Socket.IO
const sub = redis.duplicate();
await sub.connect();

await sub.subscribe("notifications", (message) => {
  if (typeof message !== "string") return;
  const parsed = JSON.parse(message);
  const { userId, message: msg } = parsed;

  // Emit to user-specific room
  io.to(userId).emit("notification", msg);
});

httpServer.listen(4001, () => {
  console.log("🚀 Socket.IO server running on http://localhost:4001");
});
