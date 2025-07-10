"use client";

import { useTransition } from "react";

import { sendNotification } from "../actions/notify";

export function NotifyButton({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      await sendNotification({
        userId,
        message: "You have a new alert!",
        type: "product",
      });
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="rounded bg-green-600 px-4 py-2 text-white"
    >
      {isPending ? "Sending..." : "Send Notification"}
    </button>
  );
}
