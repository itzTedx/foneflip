import Link from "next/link";

import { IconArrowLeft } from "@tabler/icons-react";

import type { Vendor } from "@ziron/db/types";
import { Avatar, AvatarFallback, AvatarImage } from "@ziron/ui/avatar";
import { Button } from "@ziron/ui/button";
import { StatusBadge, StatusBadgeDot } from "@ziron/ui/status-badge";

import { getStatusLabel } from "../../utils/status-label";

interface Props {
  vendor: Vendor;
}

export function VendorProfileCard({ vendor }: Props) {
  return (
    <div className="flex items-center gap-3 py-4">
      <Button asChild size="icon" variant="outline">
        <Link href="/vendors">
          <IconArrowLeft className="size-4" />
        </Link>
      </Button>
      <Avatar className="size-16">
        <AvatarImage alt={vendor.businessName ?? ""} className="rounded-md" src={vendor.logo ?? undefined} />
        <AvatarFallback className="rounded-md">{vendor.businessName?.[0]}</AvatarFallback>
      </Avatar>
      <div>
        <div className="flex items-center gap-2">
          <h2 className="font-medium text-2xl">{vendor.businessName}</h2>
          <VendorStatusBadge status={vendor.status} />
        </div>
        <p className="text-muted-foreground text-sm">{vendor.businessCategory}</p>
      </div>
    </div>
  );
}

// Status badge mapping
function VendorStatusBadge({ status }: { status: string }) {
  return (
    <StatusBadge
      className="capitalize"
      status={
        status === "active"
          ? "success"
          : status === "pending_approval"
            ? "info"
            : status === "rejected"
              ? "error"
              : status === "suspended"
                ? "warn"
                : status === "onboarding"
                  ? "info"
                  : status === "approved"
                    ? "success"
                    : "disabled"
      }
      variant="light"
    >
      <StatusBadgeDot />
      {getStatusLabel(status)}
    </StatusBadge>
  );
}
