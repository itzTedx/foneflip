"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

type Notification = {
  message: string;
  type: string;
};

export function NotificationSocket({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<Notification[]>([]);
  const socket = io("http://localhost:4000", { transports: ["websocket"] });

  useEffect(() => {
    socket.emit("join", userId);

    socket.on("notification", (data: Notification) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`bg-${msg.type === "alert" ? "red" : "blue"}-700 rounded p-2 text-white shadow`}
        >
          🔔 {msg.message}
        </div>
      ))}
    </div>
  );
}
