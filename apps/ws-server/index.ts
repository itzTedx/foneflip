import http from "http";
import express from "express";
import { Server } from "socket.io";

import redis from "@ziron/redis";

const app = express();
app.use(express.json());

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

const clients = new Map<string, any>(); // userId -> socket

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId as string;
  console.log("Client connected", userId, "Socket ID:", socket.id);
  if (userId) clients.set(userId, socket);

  socket.on("disconnect", () => {
    if (userId) clients.delete(userId);
    console.log("Client disconnected", userId, "Socket ID:", socket.id);
  });
});

// Subscribe to notifications channel from Redis
redis.subscribe("notifications");
redis.on("message", (channel: string, message: string) => {
  if (channel === "notifications") {
    try {
      const { userId, ...data } = JSON.parse(message);
      const socket = clients.get(userId);
      console.log("Redis notification received", {
        userId,
        data,
        found: !!socket,
      });
      if (socket) {
        socket.emit("notification", data);
      } else {
        console.log(
          "No socket found for userId (from Redis notification):",
          userId,
        );
      }
    } catch (e) {
      console.error("Error handling Redis notification", e);
    }
  }
});

// HTTP API for worker to send notifications
app.post("/send", (req, res) => {
  try {
    const { userId, ...data } = req.body;
    const socket = clients.get(userId);
    console.log("POST /send", { userId, data, found: !!socket });
    if (socket) {
      console.log(
        "Emitting notification to userId:",
        userId,
        "Socket ID:",
        socket.id,
        "Notification data:",
        data,
      );
      socket.emit("notification", data);
    } else {
      console.log("No socket found for userId:", userId);
    }
    res.status(200).send("ok");
  } catch (e) {
    console.error("Error in /send", e);
    res.status(400).send("bad request");
  }
});

const PORT = 4000;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO + Express server running on ws://localhost:${PORT}`);
  console.log(`HTTP API for notifications on http://localhost:${PORT}/send`);
});
