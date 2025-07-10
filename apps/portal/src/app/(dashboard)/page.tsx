import Link from "next/link";
import { LogoutButton } from "@/components/ui/logout-button";
import { NotifyButton } from "@/features/notifications/components/notification-button";
import { NotificationSocket } from "@/features/notifications/components/notification-socket";
import { getSession } from "@/lib/auth/server";

import { Button } from "@ziron/ui/components/button";

export default async function Page() {
  const session = await getSession();
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hello World</h1>

        <pre>{JSON.stringify(session, null, 2)}</pre>

        {session ? (
          <Button asChild>
            <LogoutButton>Logout</LogoutButton>
          </Button>
        ) : (
          <Button asChild>
            <Link href="/register">Register</Link>
          </Button>
        )}

        {session && <NotifyButton userId={session.user.id} />}
        {session && <NotificationSocket userId={session.user.id} />}
      </div>
    </div>
  );
}
