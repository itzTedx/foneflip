import Link from "next/link";

import { IconArrowLeft } from "@tabler/icons-react";

import type { Vendor } from "@ziron/db/types";
import { Avatar, AvatarFallback, AvatarImage } from "@ziron/ui/avatar";
import { Badge } from "@ziron/ui/badge";
import { Button } from "@ziron/ui/button";
import { cn } from "@ziron/utils";

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
  let variant: "default" | "secondary" | "warn" | "destructive" | "outline" | "success" = "outline";
  const label = status.replace(/_/g, " ");
  if (status === "approved" || status === "active") variant = "success";
  if (status === "pending_approval") variant = "warn";
  if (status === "rejected" || status === "suspended") variant = "destructive";
  if (status === "onboarding") variant = "default";
  return (
    <Badge className={cn("capitalize")} variant={variant}>
      {label}
    </Badge>
  );
}
