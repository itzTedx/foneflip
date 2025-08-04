import Link from "next/link";

import {
  IconAlertTriangle,
  IconBrandWhatsapp,
  IconEdit,
  IconMail,
  IconPhoneCall,
  IconWorld,
} from "@tabler/icons-react";
import { Ellipsis } from "lucide-react";

import { Vendor } from "@ziron/db/types";
import { Avatar, AvatarFallback, AvatarImage } from "@ziron/ui/avatar";
import { Badge } from "@ziron/ui/badge";
import { Button } from "@ziron/ui/button";
import { Card, CardContent, CardFooter } from "@ziron/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ziron/ui/dropdown-menu";
import { StatusBadge, StatusBadgeDot } from "@ziron/ui/status-badge";
import { formatDate, pluralize } from "@ziron/utils";

import { SimpleTooltip } from "@/components/ui/tooltip";

import { getStatusLabel } from "../../utils/status-label";

interface VendorCardProps {
  vendor: Vendor;
  showActions?: boolean;
}

export const VendorCard = ({ vendor, showActions = true }: VendorCardProps) => {
  const status = vendor.status;
  // Check if vendor needs verification
  const needsVerification = status === "pending_approval";

  return (
    <Card className="relative overflow-hidden transition-[border-color] duration-300 hover:border-primary/50">
      <Link
        className="absolute inset-0 z-0"
        href={`/vendors/${vendor.id}?title=${encodeURIComponent(vendor.businessName ?? "")}`}
      />

      <CardContent className="space-y-2 sm:space-y-4">
        <div className="relative z-10 flex items-center gap-2">
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
                  <SimpleTooltip tooltip="Verify documents">
                    <IconAlertTriangle className="mt-0.5 size-3 shrink-0 text-warn" />
                  </SimpleTooltip>
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
                        <Link href={`/vendors/${vendor.id}?title=${encodeURIComponent(vendor.businessName ?? "")}`}>
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
              {vendor.vendorName && (
                <>
                  <p className="whitespace-nowrap text-muted-foreground text-xs">{vendor.vendorName}</p>
                  {/* <div className="bg-muted-foreground/50 size-1 rounded-full" /> */}
                </>
              )}
            </div>
          </div>
        </div>
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

        <div className="relative z-10 flex w-fit items-center gap-2">
          {vendor.vendorEmail && (
            <SimpleTooltip asChild tooltip="Email">
              <Button className="text-muted-foreground" size="btn" variant="outline">
                <Link href={`mailto:${vendor.vendorEmail}`}>
                  <IconMail size={14} />
                </Link>
              </Button>
            </SimpleTooltip>
          )}
          {vendor.vendorNumber && (
            <SimpleTooltip asChild tooltip="Phone">
              <Button className="text-muted-foreground" size="btn" variant="outline">
                <Link href={`tel:${vendor.vendorNumber}`}>
                  <IconPhoneCall size={14} />
                </Link>
              </Button>
            </SimpleTooltip>
          )}
          {vendor.vendorWhatsappNumber && (
            <SimpleTooltip asChild tooltip="WhatsApp">
              <Button className="text-muted-foreground" size="btn" variant="outline">
                <Link href={`https://wa.me/${vendor.vendorWhatsappNumber}`}>
                  <IconBrandWhatsapp size={14} />
                </Link>
              </Button>
            </SimpleTooltip>
          )}
          {vendor.website && (
            <SimpleTooltip asChild tooltip="Website">
              <Button className="text-muted-foreground" size="btn" variant="outline">
                <Link href={vendor.website} rel="noopener noreferrer" target="_blank">
                  <IconWorld size={14} />
                </Link>
              </Button>
            </SimpleTooltip>
          )}
        </div>
      </CardContent>
      <CardFooter className="mt-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
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
            {getStatusLabel(vendor.status)}
          </StatusBadge>
        </div>
        <p className="font-light text-muted-foreground text-xs">
          {formatDate(vendor.createdAt, {
            includeTime: true,
            relative: true,
          })}
        </p>
      </CardFooter>
    </Card>
  );
};
