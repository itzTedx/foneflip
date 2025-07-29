import { LogoutButton } from "@/components/ui/logout-button";
import { getSession } from "@/lib/auth/server";
import { sendMockNotification } from "@/modules/notifications/actions/sendMockNotification";
import Link from "next/link";

import { Button } from "@ziron/ui/button";

export default async function Page() {
  const session = await getSession();
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hello World</h1>

        <pre className="text-xs text-wrap">
          {JSON.stringify(session, null, 2)}
        </pre>

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
              console.log("notification send");
            }}
          >
            <Button type="submit">Send Mock Notification</Button>
          </form>
        )}
      </div>
    </div>
  );
}
