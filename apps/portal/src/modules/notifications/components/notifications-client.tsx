"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export default function NotificationsClient({
  userId,
  initialNotifications,
}: {
  userId: string;
  initialNotifications: any[];
}) {
  const [notifications, setNotifications] = useState(initialNotifications);

  useEffect(() => {
    if (!userId) return;
    const socket: Socket = io("ws://localhost:4000", {
      query: { userId },
      transports: ["websocket"],
    });
    socket.on("connect", () => console.log("Socket.IO connected"));
    socket.onAny((event, ...args) => {
      console.log("Socket event:", event, args);
    });
    socket.on("notification", (notification) => {
      console.log("Received notification", notification);
      setNotifications((prev) => [notification, ...prev]);
    });
    return () => {
      socket.disconnect();
    };
  }, [userId]);

  return (
    <div className="relative mb-6">
      <div className="inline-block">
        <div className="flex cursor-pointer items-center">
          <span className="material-icons mr-2">notifications</span>
          Notifications ({notifications.length})
        </div>
        <div className="absolute left-0 z-10 mt-2 w-72 rounded-md border border-[#3a4a7a] bg-[#22223a] shadow-lg">
          {notifications.length === 0 ? (
            <div className="p-4 text-[#a0b0ff]">No notifications</div>
          ) : (
            notifications.map((n: any) => (
              <div
                key={n.id || n.message}
                className="border-b border-[#3a4a7a] p-4 last:border-b-0"
              >
                <div className="font-bold text-[#a0b0ff]">{n.type}</div>
                <div className="text-[#dcdceb]">{n.message}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
