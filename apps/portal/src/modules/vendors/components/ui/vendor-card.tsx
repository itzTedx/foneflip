import Link from "next/link";

import { IconAlertTriangle, IconEdit, IconMail, IconWorld } from "@tabler/icons-react";
import { Ellipsis } from "lucide-react";

import { Vendor } from "@ziron/db/types";
import { Avatar, AvatarFallback, AvatarImage } from "@ziron/ui/avatar";
import { Badge } from "@ziron/ui/badge";
import { Button } from "@ziron/ui/button";
import { Card, CardContent, CardHeader } from "@ziron/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ziron/ui/dropdown-menu";
import { cn, formatDate, pluralize } from "@ziron/utils";

import { TooltipBadge } from "@/components/ui/tooltip";

interface VendorCardProps {
  vendor: Vendor;
  showActions?: boolean;
}

export const VendorCard = ({ vendor, showActions = true }: VendorCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_approval":
        return "bg-yellow-100 text-yellow-800 ";
      case "approved":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 ";
      case "suspended":
        return "bg-orange-100 text-orange-800 ";
      case "active":
        return "bg-blue-100 text-blue-800 ";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-muted dark:text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending_approval":
        return "Pending Approval";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      case "suspended":
        return "Suspended";
      case "active":
        return "Active";
      case "onboarding":
        return "Onboard";
      default:
        return status;
    }
  };

  // Check if vendor needs verification
  const needsVerification = vendor.status === "pending_approval";

  return (
    <Card className="relative overflow-hidden transition-[border-color] duration-300 hover:border-primary/50">
      <CardHeader className="relative z-10 flex items-center gap-2">
        <Avatar className="aspect-square size-12 rounded-sm">
          <AvatarImage className="rounded-sm" src={vendor.logo ?? undefined} />
          <AvatarFallback className="shrink-0 rounded-sm">
            {vendor.businessName?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="w-full">
          <div className="flex w-full items-center justify-between">
            <h2
              className="line-clamp-1 flex items-center gap-1.5 font-medium text-lg"
              title={vendor.businessName ?? ""}
            >
              {vendor.businessName}
              {needsVerification && (
                <TooltipBadge tooltip="Verify documents">
                  <IconAlertTriangle className="mt-0.5 size-3 shrink-0 text-yellow-600" />
                </TooltipBadge>
              )}
            </h2>
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="size-7" size={"icon"} variant={"ghost"}>
                    <Ellipsis />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href={`/vendors/${vendor.slug}`}>
                        <IconEdit aria-hidden="true" className="opacity-60" size={16} />
                        <span>View Details</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/vendors/${vendor.slug}/edit`}>
                        <IconEdit aria-hidden="true" className="opacity-60" size={16} />
                        <span>Edit</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <IconMail aria-hidden="true" className="opacity-60" size={16} />
                    <span>Send Message</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <div className="flex items-center gap-2">
            {vendor.businessName && (
              <>
                <p className="whitespace-nowrap text-muted-foreground text-xs">{vendor.businessName}</p>
                {/* <div className="bg-muted-foreground/50 size-1 rounded-full" /> */}
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {vendor.businessCategory && (
            <Badge className="capitalize" variant="secondary">
              {vendor.businessCategory}
            </Badge>
          )}

          {vendor.members && vendor.members.length > 0 && (
            <Badge variant="outline">
              {vendor.members.length} {pluralize("member", vendor.members.length)}
            </Badge>
          )}
        </div>

        <div className="flex flex-col gap-1">
          {vendor.vendorEmail && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <IconMail size={14} />
              <span>{vendor.vendorEmail}</span>
            </div>
          )}
          {vendor.website && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <IconWorld size={14} />
              <a
                className="transition-colors hover:text-primary"
                href={vendor.website}
                rel="noopener noreferrer"
                target="_blank"
              >
                {vendor.website}
              </a>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className={cn(getStatusColor(vendor.status))} variant="outline">
              {getStatusLabel(vendor.status)}
            </Badge>
          </div>
          <p className="font-light text-muted-foreground text-xs">
            {formatDate(vendor.createdAt, {
              includeTime: true,
              relative: true,
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
