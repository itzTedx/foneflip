"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { Button } from "@ziron/ui/button";
import { LoadingSwap } from "@ziron/ui/loading-swap";

import { createAdminOrganization } from "../actions/mutation";

interface CreateBaseVendorProps {
  userId: string;
}

export const CreateBaseVendor = ({ userId }: CreateBaseVendorProps) => {
  const [isPending, startTransition] = useTransition();
  if (!userId || typeof userId !== "string") {
    throw new Error("Valid userId is required");
  }
  const router = useRouter();

  const handleCreateAdminOrganization = () => {
    startTransition(async () => {
      const { error, message, data } = await createAdminOrganization({
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

      toast.success("Admin organization created successfully");
      console.log("Admin organization data:", data);

      // Redirect to admin dashboard or organization management
      router.push("/dashboard");
    });
  };

  return (
    <Button onClick={handleCreateAdminOrganization} size="sm" variant="secondary">
      <LoadingSwap isLoading={isPending}>Create Admin Organization</LoadingSwap>
    </Button>
  );
};
