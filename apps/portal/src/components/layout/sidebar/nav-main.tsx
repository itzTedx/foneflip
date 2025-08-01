"use client";

import React, { ElementType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { type Icon } from "@tabler/icons-react";

import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@ziron/ui/sidebar";

/**
 * Renders a sidebar navigation menu with items that display icons, animated icons, and titles.
 *
 * Each menu item navigates to the specified URL and highlights as active when the current path matches the item's URL.
 *
 * @param items - An array of navigation items, each with a title, URL, and optional icon or animated icon
 */
export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon | ElementType;
    animatedIcon?: React.ReactElement;
  }[];
}) {
  const pathname = usePathname();
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={pathname.startsWith(item.url)} tooltip={item.title}>
                <Link href={item.url}>
                  {item.animatedIcon && <>{item.animatedIcon}</>}
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
