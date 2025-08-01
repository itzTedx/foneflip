import { IconLayoutSidebar } from "@tabler/icons-react";

import { Session } from "@ziron/auth";
import { SidebarTrigger } from "@ziron/ui/sidebar";

import { CacheManagement } from "@/modules/cache/components/cache-management";
import { getNotifications } from "@/modules/notifications/actions/queries";

import { NavBreadcrumb } from "./nav-breadcrumb";
import Notifications from "./notifications";
import { ThemeToggle } from "./theme-toggle";
import UserMenu from "./user-menu";

interface NavbarProps {
  session: Session | null;
}

export default async function Navbar({ session }: NavbarProps) {
  const notifications = await getNotifications(session?.user.id);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-12 max-w-7xl items-center gap-1 px-4 max-sm:justify-between sm:grid sm:grid-cols-3 md:px-6">
        <div className="flex flex-1 items-center gap-2">
          <SidebarTrigger className="md:hidden">
            <IconLayoutSidebar />
          </SidebarTrigger>
          <NavBreadcrumb />
        </div>
        <div />
        {/* <SearchField /> */}

        {!session && <ThemeToggle />}
        {session && (
          <div className="flex flex-1 items-center justify-end gap-3">
            {/* Cache Management (Dev Only) */}
            <CacheManagement />
            <Notifications initialNotifications={notifications} />
            <UserMenu />
          </div>
        )}
      </div>
    </header>
  );
}
