"use client";

import { useTransition } from "react";

import { toast } from "sonner";

import { Button } from "@ziron/ui/button";
import { LoadingSwap } from "@ziron/ui/loading-swap";

import { createOrganization } from "../actions/mutation";

export const CreateBaseVendor = ({ userId }: { userId: string }) => {
  const [isPending, startTransition] = useTransition();

  const handleCreateOrganization = () => {
    startTransition(async () => {
      const { error, message, data } = await createOrganization({
        name: "Foneflip",
        slug: "foneflip",
        userId,
        category: "Reseller",
        website: "https://foneflip.com",
      });

      if (error) {
        toast.error(message);
        return;
      }

      toast.success("Organization created successfully");
      console.log(data);
    });
  };

  return (
    <Button onClick={handleCreateOrganization} size="sm" variant="secondary">
      <LoadingSwap isLoading={isPending}>Create Organization</LoadingSwap>
    </Button>
  );
};
