"use client";

import { useEffect, useState, useTransition } from "react";

import { BellIcon } from "lucide-react";
import { io, Socket } from "socket.io-client";

import { Badge } from "@ziron/ui/badge";
import { Button } from "@ziron/ui/button";
import { LoadingSwap } from "@ziron/ui/loading-swap";
import { Popover, PopoverContent, PopoverTrigger } from "@ziron/ui/popover";
import { ScrollArea } from "@ziron/ui/scroll-area";
import { toast } from "@ziron/ui/sonner";
import { cn, formatDate } from "@ziron/utils";

import { useSession } from "@/lib/auth/client";
import { markAllNotificationsAsRead, markNotificationAsRead } from "@/modules/notifications/actions/mutation";
import { getNotifications } from "@/modules/notifications/actions/queries";

interface NotificationProp {
  userId: string;
  id: string;
  metadata: unknown;
  type: string;
  message: string;
  read: boolean | null;
  createdAt: string; // comes as ISO string from server
}

type NormalizedNotification = Omit<NotificationProp, "createdAt"> & {
  createdAt: Date;
};

/**
 * Converts a notification's `createdAt` field from an ISO string to a `Date` object.
 *
 * @param notification - The notification object with a string `createdAt` field
 * @returns The notification object with `createdAt` as a `Date` instance
 */
function normalizeNotification(notification: NotificationProp): NormalizedNotification {
  return {
    ...notification,
    createdAt: new Date(notification.createdAt),
  };
}

/**
 * Displays a real-time notifications popover for the current user, supporting live updates, marking as read, and pagination.
 *
 * @param initialNotifications - Optional initial list of notifications to populate the component on mount
 * @returns A React component that renders a notifications bell with a popover containing the user's notifications
 */
export default function Notifications({ initialNotifications }: { initialNotifications?: NotificationProp[] | null }) {
  const { data } = useSession();
  const userId = data?.user.id;
  // When initializing state
  const notificationsArray = (initialNotifications ?? []).map(normalizeNotification);
  // Remove unused notifications state
  const [allLoaded, setAllLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [notifications, setNotifications] = useState<NormalizedNotification[]>(notificationsArray);

  useEffect(() => {
    const socket: Socket = io("ws://localhost:4000", {
      query: { userId },
      transports: ["websocket"],
    });

    socket.on("notification", (notification: NotificationProp) => {
      const normalized = normalizeNotification(notification);

      setNotifications((prev) => {
        const updated = [normalized, ...prev];

        return updated;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  // Update unreadCount logic to count falsy read values
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllAsRead = async () => {
    // Optimistically update UI
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
    try {
      await markAllNotificationsAsRead(userId!);
    } catch {
      toast.error("Failed to mark all as read. Please try again.");
      // Optionally: refetch notifications or handle rollback if needed
    }
  };

  const handleNotificationClick = async (id: string) => {
    // Optimistically update UI
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification))
    );
    try {
      await markNotificationAsRead(id);
    } catch {
      toast.error("Failed to mark notification as read. Please try again.");
    }
  };

  // Handler for loading more notifications using server action
  const handleLoadMore = () => {
    startTransition(async () => {
      const newNotifications = await getNotifications(userId, 10, notifications.length);
      if (!newNotifications || newNotifications.length === 0) {
        setAllLoaded(true);
      } else {
        setNotifications((prev) => [...prev, ...newNotifications.map(normalizeNotification)]);
        if (newNotifications.length < 10) setAllLoaded(true);
      }
    });
  };

  // Render empty state if no notifications
  if (!notifications.length) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button aria-label="Open notifications" className="relative" size="btn" variant="outline">
            <BellIcon aria-hidden="true" className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-1">
          <div className="flex items-baseline justify-between gap-4 px-3 py-1">
            <div className="font-semibold text-sm">Notifications</div>
          </div>
          <div className="py-6 text-center text-muted-foreground text-xs">No notifications yet.</div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button aria-label="Open notifications" className="relative" size="btn" variant="outline">
          <BellIcon aria-hidden="true" className="size-4" />
          {unreadCount > 0 && (
            <Badge className="-top-2 -translate-x-1/2 absolute left-full min-w-4 px-1 text-[10px]">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-1">
        <div className="flex items-baseline justify-between gap-4 px-3 py-1">
          <div className="font-semibold text-sm">Notifications</div>
          {unreadCount > 0 && (
            <button className="font-medium text-xs hover:underline" onClick={handleMarkAllAsRead}>
              Mark all as read
            </button>
          )}
        </div>
        <div aria-orientation="horizontal" className="-mx-1 my-1 h-px bg-border" />

        <ScrollArea className="h-80">
          {notifications.map((notification, i) => (
            <div
              className={cn(
                "my-1 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
                !notification.read ? "bg-accent/30 font-semibold" : ""
              )}
              key={`${notification.id}-${i}`}
            >
              <div className="relative flex items-start pe-3">
                <div className="flex-1 space-y-1">
                  <button
                    className="text-left text-foreground/80 after:absolute after:inset-0"
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    {notification.type}{" "}
                    <span className="font-medium text-foreground hover:underline">{notification.message}</span>
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
            <Button className="w-full" disabled={isPending} onClick={handleLoadMore} size="sm" variant="ghost">
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
      aria-hidden="true"
      className={className}
      fill="currentColor"
      height="6"
      viewBox="0 0 6 6"
      width="6"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="3" cy="3" r="3" />
    </svg>
  );
}
