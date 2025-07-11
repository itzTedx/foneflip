"use client";

import { useEffect, useState, useTransition } from "react";
import {
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/features/notifications/actions/mutation";
import { getNotifications } from "@/features/notifications/actions/queries";
import { BellIcon } from "lucide-react";
import { io, Socket } from "socket.io-client";

import { Badge } from "@ziron/ui/components/badge";
import { Button } from "@ziron/ui/components/button";
import { LoadingSwap } from "@ziron/ui/components/loading-swap";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@ziron/ui/components/popover";
import { ScrollArea } from "@ziron/ui/components/scroll-area";
import { toast } from "@ziron/ui/components/sonner";
import { cn, formatDate } from "@ziron/utils";

interface NotificationProp {
  userId: string;
  id: string;
  metadata: unknown;
  type: string;
  message: string;
  read: boolean | null;
  createdAt: Date; // keep as string
}

type NormalizedNotification = Omit<NotificationProp, "createdAt"> & {
  createdAt: Date;
};

// Helper to ensure notification dates are Date objects
function normalizeNotification(
  notification: NotificationProp,
): NormalizedNotification {
  return {
    ...notification,
    createdAt:
      notification.createdAt instanceof Date
        ? notification.createdAt
        : new Date(notification.createdAt),
  };
}

export default function Notifications({
  userId,
  initialNotifications,
}: {
  userId: string;
  initialNotifications?: NotificationProp[] | null;
}) {
  // When initializing state
  const notificationsArray = (initialNotifications ?? []).map(
    normalizeNotification,
  );
  // Remove unused notifications state
  const [allLoaded, setAllLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [notifications, setNotifications] =
    useState<NormalizedNotification[]>(notificationsArray);

  useEffect(() => {
    if (!userId) return;
    const socket: Socket = io("ws://localhost:4000", {
      query: { userId },
      transports: ["websocket"],
    });
    socket.on("notification", (notification: NotificationProp) => {
      const normalized = normalizeNotification(notification);
      setNotifications((prev) => [normalized, ...prev]);
    });
    return () => {
      socket.disconnect();
    };
  }, [userId]);

  // Update unreadCount logic to count falsy read values
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllAsRead = async () => {
    // Optimistically update UI
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true })),
    );
    try {
      await markAllNotificationsAsRead(userId);
    } catch {
      toast.error("Failed to mark all as read. Please try again.");
      // Optionally: refetch notifications or handle rollback if needed
    }
  };

  const handleNotificationClick = async (id: string) => {
    // Optimistically update UI
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
    try {
      await markNotificationAsRead(id);
    } catch {
      toast.error("Failed to mark notification as read. Please try again.");
      // Optionally: refetch notifications or handle rollback if needed
    }
  };

  // Handler for loading more notifications using server action
  const handleLoadMore = () => {
    startTransition(async () => {
      const newNotifications = await getNotifications(
        userId,
        10,
        notifications.length,
      );
      if (!newNotifications || newNotifications.length === 0) {
        setAllLoaded(true);
      } else {
        setNotifications((prev) => [
          ...prev,
          ...newNotifications.map(normalizeNotification),
        ]);
        if (newNotifications.length < 10) setAllLoaded(true);
      }
    });
  };

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
          {notifications.map((notification, i) => (
            <div
              key={`${notification.id}-${i}`}
              className={cn(
                "hover:bg-accent my-1 rounded-md px-3 py-2 text-sm transition-colors",
                !notification.read ? "bg-accent/30 font-semibold" : "",
              )}
            >
              <div className="relative flex items-start pe-3">
                <div className="flex-1 space-y-1">
                  <button
                    className="text-foreground/80 text-left after:absolute after:inset-0"
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    {notification.type}{" "}
                    <span className="text-foreground font-medium hover:underline">
                      {notification.message}
                    </span>
                  </button>
                  <div className="text-muted-foreground text-xs">
                    {formatDate(notification.createdAt, {
                      includeTime: true,
                    })}
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
          {!allLoaded && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleLoadMore}
              disabled={isPending}
              className="w-full"
            >
              <LoadingSwap isLoading={isPending}>Load More</LoadingSwap>
            </Button>
          )}
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
