import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";

import redis from "@ziron/redis";

const app = express();
app.use(express.json());

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

const clients = new Map<string, Socket>(); // userId -> socket
const invitationWatchers = new Map<string, Set<string>>(); // invitationId -> Set of socketIds

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId as string;
  console.log("Client connected", userId, "Socket ID:", socket.id);
  if (userId) clients.set(userId, socket);

  // Handle invitation status watching
  socket.on("watch-invitation", (invitationId: string) => {
    console.log("Client watching invitation:", invitationId, "Socket ID:", socket.id);
    if (!invitationWatchers.has(invitationId)) {
      invitationWatchers.set(invitationId, new Set());
    }
    invitationWatchers.get(invitationId)!.add(socket.id);
  });

  socket.on("unwatch-invitation", (invitationId: string) => {
    console.log("Client unwatching invitation:", invitationId, "Socket ID:", socket.id);
    const watchers = invitationWatchers.get(invitationId);
    if (watchers) {
      watchers.delete(socket.id);
      if (watchers.size === 0) {
        invitationWatchers.delete(invitationId);
      }
    }
  });

  socket.on("disconnect", () => {
    if (userId) clients.delete(userId);
    // Clean up invitation watchers
    for (const [invitationId, watchers] of invitationWatchers.entries()) {
      watchers.delete(socket.id);
      if (watchers.size === 0) {
        invitationWatchers.delete(invitationId);
      }
    }
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
        console.log("No socket found for userId (from Redis notification):", userId);
      }
    } catch (e) {
      console.error("Error handling Redis notification", e);
    }
  }
});

// Subscribe to invitation updates channel from Redis
redis.subscribe("invitation-updates");
redis.on("message", (channel: string, message: string) => {
  if (channel === "invitation-updates") {
    try {
      const { invitationId, ...data } = JSON.parse(message);
      const watchers = invitationWatchers.get(invitationId);
      console.log("Redis invitation update received", {
        invitationId,
        data,
        watchersCount: watchers?.size || 0,
      });
      if (watchers) {
        // Broadcast to all sockets watching this invitation
        for (const socketId of watchers) {
          const socket = io.sockets.sockets.get(socketId);
          if (socket) {
            socket.emit("invitation-update", { invitationId, ...data });
          }
        }
      }
    } catch (e) {
      console.error("Error handling Redis invitation update", e);
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
      console.log("Emitting notification to userId:", userId, "Socket ID:", socket.id, "Notification data:", data);
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

// HTTP API for invitation status updates
app.post("/invitation-update", (req, res) => {
  try {
    const { invitationId, ...data } = req.body;
    const watchers = invitationWatchers.get(invitationId);
    console.log("POST /invitation-update", { invitationId, data, watchersCount: watchers?.size || 0 });

    if (watchers) {
      // Broadcast to all sockets watching this invitation
      for (const socketId of watchers) {
        const socket = io.sockets.sockets.get(socketId);
        if (socket) {
          console.log(
            "Emitting invitation update to Socket ID:",
            socketId,
            "Invitation ID:",
            invitationId,
            "Update data:",
            data
          );
          socket.emit("invitation-update", { invitationId, ...data });
        }
      }
    } else {
      console.log("No watchers found for invitation:", invitationId);
    }
    res.status(200).send("ok");
  } catch (e) {
    console.error("Error in /invitation-update", e);
    res.status(400).send("bad request");
  }
});

const PORT = 4000;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO + Express server running on ws://localhost:${PORT}`);
  console.log(`HTTP API for notifications on http://localhost:${PORT}/send`);
  console.log(`HTTP API for invitation updates on http://localhost:${PORT}/invitation-update`);
});
