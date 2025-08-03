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
      await clearAllVendorInvitationCaches();
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
