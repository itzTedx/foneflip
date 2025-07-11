"use client";

import { useEffect, useState } from "react";
import { markAllNotificationsAsRead } from "@/features/notifications/actions/mutation";
import { BellIcon } from "lucide-react";
import { io, Socket } from "socket.io-client";

import { Badge } from "@ziron/ui/components/badge";
import { Button } from "@ziron/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@ziron/ui/components/popover";
import { ScrollArea } from "@ziron/ui/components/scroll-area";
import { toast } from "@ziron/ui/components/sonner";

interface NotificationProp {
  userId: string;
  id: string;
  metadata: unknown;
  type: string;
  message: string;
  read: boolean | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export default function Notifications({
  userId,
  initialNotifications,
}: {
  userId: string;
  initialNotifications?: NotificationProp[] | null;
}) {
  const notificationsArray = initialNotifications ?? [];
  const [notifications, setNotifications] =
    useState<NotificationProp[]>(notificationsArray);

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
      console.log(
        "Received notification",
        notification,
        typeof notification,
        notification && notification.id,
      );
      setNotifications((prev) => {
        const updated = [notification, ...prev];
        console.log("Updated notifications state:", updated);
        return updated;
      });
    });
    return () => {
      socket.disconnect();
    };
  }, [userId]);

  const unreadCount = notifications.filter((n) => n.read === false).length;

  const handleMarkAllAsRead = async () => {
    console.log("Mark all as read clicked");
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    );
    try {
      await markAllNotificationsAsRead(userId);
    } catch {
      toast.error("Failed to mark all as read. Please try again.");
    }
  };

  const handleNotificationClick = (id: string) => {
    console.log("Notification clicked:", id);
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  };

  // Log notifications in the render
  console.log("Rendering notifications:", notifications);

  // Render empty state if no notifications
  if (!notifications.length) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="btn"
            variant="outline"
            className="relative"
            aria-label="Open notifications"
          >
            <BellIcon className="size-4" aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-1">
          <div className="flex items-baseline justify-between gap-4 px-3 py-1">
            <div className="text-sm font-semibold">Notifications</div>
          </div>
          <div className="text-muted-foreground py-6 text-center text-xs">
            No notifications yet.
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="btn"
          variant="outline"
          className="relative"
          aria-label="Open notifications"
        >
          <BellIcon className="size-4" aria-hidden="true" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 left-full min-w-4 -translate-x-1/2 px-1 text-[10px]">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-1">
        <div className="flex items-baseline justify-between gap-4 px-3 py-1">
          <div className="text-sm font-semibold">Notifications</div>
          {unreadCount > 0 && (
            <button
              className="text-xs font-medium hover:underline"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </button>
          )}
        </div>
        <div
          role="separator"
          aria-orientation="horizontal"
          className="bg-border -mx-1 my-1 h-px"
        ></div>

        <ScrollArea className="h-80">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={
                `hover:bg-accent rounded-md px-3 py-2 text-sm transition-colors ` +
                (!notification.read ? "bg-accent/30 font-semibold" : "")
              }
            >
              <div className="relative flex items-start pe-3">
                <div className="flex-1 space-y-1">
                  <button
                    className="text-foreground/80 text-left after:absolute after:inset-0"
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    {notification.type}{" "}
                    <span className="text-foreground font-medium hover:underline">
                      {notification.type}
                    </span>
                    .
                  </button>
                  <div className="text-muted-foreground text-xs">
                    {notification.createdAt.toLocaleString()}
                  </div>
                </div>
                {!notification.read && (
                  <div className="absolute end-0 self-center">
                    <span className="sr-only">Unread</span>
                    <Dot />
                  </div>
                )}
              </div>
            </div>
          ))}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function Dot({ className }: { className?: string }) {
  return (
    <svg
      width="6"
      height="6"
      fill="currentColor"
      viewBox="0 0 6 6"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="3" cy="3" r="3" />
    </svg>
  );
}
