import Link from "next/link";
import { LogoutButton } from "@/components/ui/logout-button";
import { IconLogout, IconUser } from "@tabler/icons-react";
import { BoltIcon, BookOpenIcon, Layers2Icon } from "lucide-react";

import { Session } from "@ziron/auth";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@ziron/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ziron/ui/components/dropdown-menu";
import GlareHover from "@ziron/ui/components/glare-hover";

export default function UserMenu({ data }: { data: Session | null }) {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="rounded-full">
          <Avatar>
            <GlareHover className="size-full rounded-full">
              <AvatarImage
                src={data?.user.image ?? undefined}
                alt="Profile image"
              />
              <AvatarFallback>{data?.user.name.slice(0, 1)}</AvatarFallback>
            </GlareHover>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-w-64" align="center">
          <DropdownMenuLabel className="flex min-w-0 items-center gap-1.5">
            <Avatar className="rounded-sm">
              <AvatarImage
                src={data?.user.image ?? undefined}
                alt="Profile image"
              />
              <AvatarFallback className="rounded-sm">
                {data?.user.name.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
            <div>
              <span className="text-foreground truncate text-sm font-medium">
                {data?.user.name}
              </span>
              <span className="text-muted-foreground flex items-center truncate text-xs font-normal">
                {data?.user.email}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Link
                href="/settings/profile"
                className="flex items-center gap-2"
              >
                <IconUser size={16} className="opacity-60" aria-hidden="true" />
                <span>Edit Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/users" className="flex items-center gap-2">
                <Layers2Icon
                  size={16}
                  className="opacity-60"
                  aria-hidden="true"
                />
                <span>Manage Users</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem>
              <Link href="/reports" className="flex items-center gap-2">
                <BookOpenIcon
                  size={16}
                  className="opacity-60"
                  aria-hidden="true"
                />
                <span>Report</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/settings" className="flex items-center gap-2">
                <BoltIcon size={16} className="opacity-60" aria-hidden="true" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem>
            <LogoutButton>
              <IconLogout size={16} className="opacity-60" aria-hidden="true" />
              <span>Logout</span>
            </LogoutButton>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
