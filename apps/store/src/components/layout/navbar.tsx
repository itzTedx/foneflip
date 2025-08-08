import Link from "next/link";

import { Logo } from "@ziron/ui/assets/logo";
import { Button } from "@ziron/ui/button";

export const Navbar = () => {
  return (
    <nav className="divide-y bg-background/80 backdrop-blur-xl">
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
      <div className="container mx-auto flex items-center gap-4 py-2">Categoreis bar</div>
    </nav>
  );
};
