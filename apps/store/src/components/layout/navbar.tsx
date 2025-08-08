import Link from "next/link";

import { db } from "@ziron/db/server";
import { Logo } from "@ziron/ui/assets/logo";
import { Button } from "@ziron/ui/button";
import { Separator } from "@ziron/ui/separator";

export const Navbar = async () => {
  const categories = await db.query.collectionsTable.findMany({
    with: {
      settings: true,
    },
  });

  return (
    <nav className="sticky top-0 z-9999 border-b bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between gap-2 py-2">
        <Link href="/">
          <Logo />
        </Link>
        <div>Search</div>
        <div>
          <Button asChild>
            <Link href="/auth/login">Sign in</Link>
          </Button>
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
