"use client";

import { useTransition } from "react";

import { IconRefresh } from "@ziron/ui/assets/icons";
import { Button } from "@ziron/ui/button";
import { LoadingSwap } from "@ziron/ui/loading-swap";

import { clearAllVendorInvitationCaches } from "../../actions/queries";

export const RefreshButton = () => {
  const [isPending, startTransition] = useTransition();
  const onRefresh = () => {
    startTransition(async () => {
      try {
        await clearAllVendorInvitationCaches();
        // Optional: Add success toast notification
      } catch (error) {
        console.error("Failed to clear vendor invitation caches:", error);
        // Optional: Add error toast notification
      }
    });
  };
  return (
    <Button disabled={isPending} onClick={onRefresh} size="sm" variant="outline">
      <LoadingSwap className="flex items-center gap-1" isLoading={isPending}>
        <IconRefresh />
        Refresh
      </LoadingSwap>
    </Button>
  );
};
