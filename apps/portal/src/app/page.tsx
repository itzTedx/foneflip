import Link from "next/link";
import { getSession } from "@/lib/auth/server";

import { Button } from "@ziron/ui/components/button";

export default async function Page() {
  const session = await getSession();
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hello World</h1>

        <pre>{JSON.stringify(session, null, 2)}</pre>
        <Button asChild>
          <Link href="/register">Register</Link>
        </Button>
      </div>
    </div>
  );
}
