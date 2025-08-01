"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";

import { parseAsString, useQueryState } from "nuqs";

import { IconLogoMono } from "@ziron/ui/assets/logo";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@ziron/ui/breadcrumb";
import { useIsMobile } from "@ziron/ui/hooks/use-mobile";

// Constants for better maintainability
const SEGMENT_TEXT_MAP: Record<string, Record<string, string>> = {
  new: {
    products: "Add Product",
    collections: "Add Collection",
    categories: "Add Category",
    brands: "Add Brand",
    orders: "New Order",
    customers: "Add Customer",
  },
};

const getSegmentText = (segment: string, previousSegment?: string): string => {
  if (segment === "new" && previousSegment) {
    return SEGMENT_TEXT_MAP.new?.[previousSegment] || segment;
  }
  return segment;
};

export const NavBreadcrumb = () => {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  // Get 'name' from search params using nuqs
  const [title] = useQueryState("title", parseAsString.withDefault(""));

  // Memoize path segments to avoid recalculation on every render
  const pathSegments = useMemo(() => {
    return pathname
      .split("/")
      .filter(Boolean)
      .map((segment) => segment.replace(/-/g, " "));
  }, [pathname]);

  // Memoize the breadcrumb items to prevent unnecessary re-renders
  const breadcrumbItems = useMemo(() => {
    if (pathSegments.length === 0) return null;

    // If 'title' is present, use it as the last segment
    const displaySegments = title ? [...pathSegments.slice(0, -1), title] : pathSegments;

    if (isMobile) {
      // Mobile: Only show last segment with ellipsis if there are previous segments
      const lastSegment = displaySegments[displaySegments.length - 1];
      const previousSegment = displaySegments[displaySegments.length - 2];

      return (
        <span className="flex items-center gap-2">
          {displaySegments.length > 1 && <BreadcrumbEllipsis />}
          <BreadcrumbItem>
            <BreadcrumbPage className="overflow-hidden truncate capitalize">
              {getSegmentText(lastSegment ?? "", previousSegment ?? "")}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </span>
      );
    }

    // Desktop: Show full breadcrumb
    return (
      <span className="flex items-center gap-2">
        {displaySegments.map((segment, index) => {
          const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
          const isLast = index === displaySegments.length - 1;
          const previousSegment = index > 0 ? displaySegments[index - 1] : "";

          return (
            <React.Fragment key={href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem className="capitalize">
                {isLast ? (
                  <BreadcrumbPage className="overflow-hidden truncate">
                    {getSegmentText(segment, previousSegment)}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink className="capitalize" href={href}>
                    {getSegmentText(segment, previousSegment)}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </span>
    );
  }, [pathSegments, isMobile, title]);

  return (
    <Breadcrumb className="flex-1">
      <BreadcrumbList className="flex-nowrap">
        <BreadcrumbItem>
          <BreadcrumbLink href="/">
            <span>
              <IconLogoMono className="size-5" />
            </span>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {breadcrumbItems}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
