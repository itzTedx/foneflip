import Link from "next/link";
import { LogoutButton } from "@/components/ui/logout-button";
import { sendMockNotification } from "@/features/notifications/actions/sendMockNotification";
import NotificationsClient from "@/features/notifications/components/notifications-client";
import { getSession } from "@/lib/auth/server";

import { db } from "@ziron/db/client";
import { Button } from "@ziron/ui/components/button";

export default async function Page() {
  const session = await getSession();
  const notifications = await db.query.notificationsTable.findMany();
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hello World</h1>

        <pre className="text-xs">{JSON.stringify(session, null, 2)}</pre>

        {session ? (
          <Button asChild>
            <LogoutButton>Logout</LogoutButton>
          </Button>
        ) : (
          <Button asChild>
            <Link href="/register">Register</Link>
          </Button>
        )}

        {session && (
          <form
            action={async () => {
              "use server";
              await sendMockNotification(session.user.id);
            }}
          >
            <Button type="submit">Send Mock Notification</Button>
          </form>
        )}

        {session && (
          <NotificationsClient
            userId={session.user.id}
            initialNotifications={notifications}
          />
        )}
      </div>
    </div>
  );
}
