import Link from "next/link";

import { db } from "@ziron/db/server";
import { IconBolt } from "@ziron/ui/assets/icons";
import { Logo } from "@ziron/ui/assets/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@ziron/ui/avatar";
import { Button } from "@ziron/ui/button";
import { Input } from "@ziron/ui/input";
import { Separator } from "@ziron/ui/separator";

import { getSession } from "@/lib/auth/server";

export const Navbar = async () => {
  const categories = await db.query.collectionsTable.findMany({
    with: {
      settings: true,
    },
  });
  const session = await getSession();

  return (
    <nav className="sticky top-0 z-9999 border-b bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between gap-2 py-2">
        <Link href="/">
          <Logo className="h-9" />
        </Link>
        <div>Search</div>
        <div>
          {session ? (
            <Avatar>
              <AvatarImage src={session.user.image ?? ""} />
              <AvatarFallback>{session.user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          ) : (
            <Button asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
      <Separator />
      <ul className="container mx-auto flex items-center gap-3 py-2 text-sm">
        <li>
          <Link
            className="flex h-9 items-center justify-center rounded-sm bg-muted px-3 py-1.5 font-medium"
            href="/shop"
          >
            Shop
          </Link>
        </li>
        {categories.map(
          (category) =>
            category.settings.showInNav && (
              <li key={category.id}>
                <Link
                  className="flex h-9 items-center justify-center rounded-sm bg-muted px-3 py-1.5"
                  href={`/shop/${category.slug}`}
                >
                  {category.title}
                </Link>
              </li>
            )
        )}
        <li className="flex-1">
          <Input className="w-full bg-muted" placeholder="Search..." />
        </li>
        <li>
          <Link className="flex h-9 items-center justify-center rounded-sm bg-muted px-3 py-1.5" href="/help">
            Help
          </Link>
        </li>
        <li>
          <Link className="flex h-9 items-center justify-center rounded-sm bg-muted px-3 py-1.5" href="/sell-phone">
            Sell your phone
          </Link>
        </li>
        <li>
          <Link
            className="flex h-9 items-center justify-center gap-1.5 rounded-sm bg-muted px-3 py-1.5"
            href="/sell-phone"
          >
            <IconBolt className="size-4 text-warn" />
            Foneflip Express
          </Link>
        </li>
      </ul>
    </nav>
  );
};
