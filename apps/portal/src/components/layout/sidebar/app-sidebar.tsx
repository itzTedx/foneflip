"use client";

import * as React from "react";
import Link from "next/link";

import type { Icon } from "@tabler/icons-react";
import {
  IconCategory,
  IconCirclePlusFilled,
  IconDeviceMobileRotated,
  IconFolder,
  IconPackage,
  IconPhoto,
  IconPuzzle,
  IconReport,
  IconSettings,
  IconUsersGroup,
  IconWorld,
} from "@tabler/icons-react";

import { Session } from "@ziron/auth";
import { IconProducts, IconVendors } from "@ziron/ui/assets/icons";
import { LayoutDashboardIcon } from "@ziron/ui/assets/icons/layout-dashboard";
import { IconLogo, LogoWordMark } from "@ziron/ui/assets/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ziron/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@ziron/ui/sidebar";

import { canAccessSettings, UserRole } from "@/lib/auth/access-control";

import { NavDocuments } from "./nav-documents";
import { NavMain } from "./nav-main";
import { NavStorefront } from "./nav-storefront";

// Define navigation items with role restrictions
const getNavigationData = (userRole: UserRole) => {
  const allNavItems = [
    {
      title: "Products",
      url: "/products",
      icon: IconPackage,
      allowedRoles: ["admin", "vendor", "dev"] as UserRole[],
    },
    {
      title: "Collections",
      url: "/collections",
      animatedIcon: <LayoutDashboardIcon animateOnHover />,
      allowedRoles: ["admin", "dev"] as UserRole[],
    },
    {
      title: "Orders",
      url: "/orders",
      icon: IconFolder,
      allowedRoles: ["admin", "vendor", "dev"] as UserRole[],
    },
    {
      title: "Users",
      url: "/users",
      icon: IconUsersGroup,
      allowedRoles: ["admin", "vendor", "dev"] as UserRole[],
    },
    {
      title: "Vendors",
      url: "/vendors",
      icon: IconVendors,
      allowedRoles: ["admin", "dev"] as UserRole[],
    },
  ];

  const allDocuments = [
    {
      name: "Media",
      url: "/media",
      icon: IconPhoto,
      allowedRoles: ["admin", "vendor", "dev"] as UserRole[],
    },
    {
      name: "Reports",
      url: "/reports",
      icon: IconReport,
      allowedRoles: ["admin", "dev"] as UserRole[],
    },
  ];
  const allStorefront = [
    {
      name: "Banners & Media",
      url: "/store/banner",
      icon: IconDeviceMobileRotated,
      allowedRoles: ["admin", "dev"] as UserRole[],
    },
    {
      name: "Widgets & Blocks",
      url: "/store/seo",
      icon: IconPuzzle,
      allowedRoles: ["admin", "dev"] as UserRole[],
    },
    {
      name: "SEO & Meta",
      url: "/store/seo",
      icon: IconWorld,
      allowedRoles: ["admin", "dev"] as UserRole[],
    },
  ];

  // Filter items based on user role and return clean objects
  const navMain = allNavItems
    .filter((item) => item.allowedRoles.includes(userRole))
    .map((item) => ({
      title: item.title,
      url: item.url,
      icon: item.icon,
      animatedIcon: item.animatedIcon,
    }));

  const documents = allDocuments
    .filter((item) => item.allowedRoles.includes(userRole))
    .map((item) => ({
      name: item.name,
      url: item.url,
      icon: item.icon,
    }));

  const storefront = allStorefront
    .filter((item) => item.allowedRoles.includes(userRole))
    .map((item) => ({
      name: item.name,
      url: item.url,
      icon: item.icon,
    }));

  return { navMain, documents, storefront };
};

/**
 * Renders the sidebar content with navigation sections, quick create menu, and optional settings link.
 *
 * Displays main navigation, documents, and storefront links based on the provided arrays. Includes a "Quick Create" dropdown for creating products or collections, and conditionally shows a settings link in the footer.
 *
 * @param navMain - Array of main navigation items to display
 * @param documents - Array of document navigation items to display
 * @param storefront - Array of storefront navigation items to display
 * @param showSettings - Whether to display the settings link in the sidebar footer
 */
function SidebarContentWrapper({
  navMain,
  documents,
  storefront,
  showSettings,
}: {
  navMain: Array<{
    title: string;
    url: string;
    icon?: React.ComponentType<{ className?: string }>;
    animatedIcon?: React.ReactElement;
  }>;
  documents: Array<{
    name: string;
    url: string;
    icon: Icon;
  }>;
  storefront: Array<{
    name: string;
    url: string;
    icon: Icon;
  }>;
  showSettings: boolean;
}) {
  const { state } = useSidebar();

  return (
    <>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link href="/">
                <IconLogo className="!size-5" />
                <span>
                  <LogoWordMark className="h-6 w-auto" />
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent className="no-scrollbar">
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      className="inset-shadow-[0_-3px_5px_0] inset-shadow-primary-background/40 min-w-8 border-background border-t bg-gradient-to-t from-primary to-primary/85 text-primary-foreground shadow-lg shadow-primary/20 duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground dark:border-foreground/20"
                      tooltip="Quick Create"
                    >
                      <IconCirclePlusFilled />
                      <span>Quick Create</span>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-(--radix-dropdown-menu-trigger-width) min-w-40 rounded-lg"
                    side={state === "expanded" ? "bottom" : "right"}
                    sideOffset={4}
                  >
                    <DropdownMenuLabel>Quick Create</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup className="grid grid-cols-2 gap-2">
                      <DropdownMenuItem asChild>
                        <Link className="!gap-0 flex flex-col items-center pt-2" href="/products/new">
                          <IconProducts className="size-5 fill-foreground" />
                          <span className="text-muted-foreground text-sm">Product</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link className="!gap-0 flex flex-col items-center pt-2" href="/collections/new">
                          <IconCategory className="size-5 text-foreground" />
                          <span className="text-muted-foreground text-sm">Collection</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        <NavMain items={navMain} />
        <NavDocuments items={documents} />
        <NavStorefront items={storefront} />
      </SidebarContent>
      <SidebarFooter>
        {showSettings && (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/settings">
                  <IconSettings />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
        <SidebarMenu>
          <SidebarMenuItem className="flex w-full items-center gap-2">
            <SidebarMenuButton
              asChild
              className="justify-start font-normal text-muted-foreground"
              tooltip="Toggle Sidebar"
            >
              <SidebarTrigger />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </>
  );
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  session: Session | null;
}

/**
 * Renders the application sidebar with navigation sections filtered by the user's role.
 *
 * Displays main navigation, documents, and storefront links appropriate to the user's role, and conditionally shows a settings link for users with sufficient permissions.
 */
export function AppSidebar({ session, ...props }: AppSidebarProps) {
  const userRole = (session?.user?.role || "user") as UserRole;
  const data = getNavigationData(userRole);

  // Only show settings for admin and dev roles
  const showSettings = canAccessSettings(userRole);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContentWrapper
        documents={data.documents}
        navMain={data.navMain}
        showSettings={showSettings}
        storefront={data.storefront}
      />
    </Sidebar>
  );
}
