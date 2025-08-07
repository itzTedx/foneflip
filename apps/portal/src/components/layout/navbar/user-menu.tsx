"use client";

import Link from "next/link";

import { IconBook, IconLogout, IconPhone, IconSettings, IconUser } from "@tabler/icons-react";
import { BookOpenIcon, Layers2Icon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@ziron/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ziron/ui/dropdown-menu";
import GlareHover from "@ziron/ui/glare-hover";

import { LogoutButton } from "@/components/ui/logout-button";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { useSession } from "@/lib/auth/client";

export default function UserMenu() {
  const { data } = useSession();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full">
        <Avatar className="size-10 sm:size-9">
          <GlareHover className="size-full rounded-full">
            <AvatarImage alt="Profile image" src={data?.user.image ?? undefined} />
            <AvatarFallback>{data?.user.name.slice(0, 1)}</AvatarFallback>
          </GlareHover>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="z-99999 max-w-72">
        <DropdownMenuLabel className="flex min-w-0 items-center gap-1.5">
          <Avatar className="size-11 rounded-sm">
            <AvatarImage alt="Profile image" src={data?.user.image ?? undefined} />
            <AvatarFallback className="rounded-sm">{data?.user.name.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <div>
            <span className="truncate font-medium text-foreground text-sm">{data?.user.name}</span>
            <span className="flex items-center truncate font-normal text-muted-foreground text-xs">
              {data?.user.email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <ThemeSwitcher />

        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Link className="flex items-center gap-2" href="/settings/profile">
              <IconUser aria-hidden="true" className="opacity-60" size={16} />
              <span>Edit Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link className="flex items-center gap-2" href="/users">
              <Layers2Icon aria-hidden="true" className="opacity-60" size={16} />
              <span>Manage Users</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem>
            <Link className="flex items-center gap-2" href="/reports">
              <BookOpenIcon aria-hidden="true" className="opacity-60" size={16} />
              <span>Reports</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link className="flex items-center gap-2" href="/settings">
              <IconSettings aria-hidden="true" className="opacity-60" size={16} />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Link className="flex items-center gap-2" href="/settings">
              <IconBook aria-hidden="true" className="opacity-60" size={16} />
              <span>Documentation</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link className="flex items-center gap-2" href="/settings">
              <IconPhone aria-hidden="true" className="opacity-60" size={16} />
              <span>Support Center</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <LogoutButton>
            <IconLogout aria-hidden="true" className="opacity-60" size={16} />
            <span>Logout</span>
          </LogoutButton>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
