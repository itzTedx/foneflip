"use client";

import { useTransition } from "react";

import { toast } from "sonner";

import { Button } from "@ziron/ui/button";
import { LoadingSwap } from "@ziron/ui/loading-swap";

import { authClient } from "@/lib/auth/client";

export const CreateBaseVendor = () => {
  const [isPending, startTransition] = useTransition();

  const handleCreateOrganization = () => {
    startTransition(async () => {
      const { data, error } = await authClient.organization.create({
        name: "Foneflip", // required
        slug: "foneflip", // required
      });

      if (error) {
        toast.error(error.message);
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
