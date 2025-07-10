import { Session } from "@ziron/auth";

import { NavBreadcrumb } from "./nav-breadcrumb";
import Notifications from "./notifications";
import UserMenu from "./user-menu";

interface NavbarProps {
  session: Session | null;
}

export default function Navbar({ session }: NavbarProps) {
  return (
    <header className="bg-background/90 sticky top-0 z-50 border-b backdrop-blur-xl">
      <div className="mx-auto grid h-12 max-w-7xl grid-cols-2 items-center gap-1 px-4 sm:grid-cols-3 md:px-6">
        <div className="flex flex-1 items-center gap-2">
          {/* <SidebarToggle /> */}
          <NavBreadcrumb />
        </div>
        <div></div>
        {/* <SearchField /> */}

        <div className="flex flex-1 items-center justify-end gap-3">
          <Notifications />
          <UserMenu data={session} />
        </div>
      </div>
    </header>
  );
}
