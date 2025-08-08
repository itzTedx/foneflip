import Link from "next/link";

import { db } from "@ziron/db/server";
import { Logo } from "@ziron/ui/assets/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@ziron/ui/avatar";
import { Button } from "@ziron/ui/button";
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
      <div className="container mx-auto flex items-center gap-4 py-2">
        <Link href="/shop">Shop</Link>
        {categories.map(
          (category) =>
            category.settings.showInNav && (
              <Link href={`/shop/${category.slug}`} key={category.id}>
                {category.title}
              </Link>
            )
        )}
      </div>
    </nav>
  );
};
