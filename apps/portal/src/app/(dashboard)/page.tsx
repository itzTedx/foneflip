import { redirect } from "next/navigation";

import { Button } from "@ziron/ui/button";

import { getSession } from "@/lib/auth/server";
import LineChartComp from "@/modules/dashboard/components/chart";
import { sendMockNotification } from "@/modules/notifications/actions/sendMockNotification";
import { CreateBaseVendor } from "@/modules/vendors/components/create-base-vendor";

export default async function Page() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return (
    <main className="@container mx-auto flex max-w-7xl flex-1 flex-col gap-4 px-6 py-3">
      <div className="flex flex-col gap-4 md:flex-row md:items-end lg:justify-between">
        <div className="space-y-1">
          <h1 className="font-semibold text-2xl">Hey, {session.user?.name}!</h1>
          <p className="text-muted-foreground text-sm">
            Here&rsquo;s an overview of your products and accessories. Manage listings or add new items with ease!
          </p>
        </div>
        <div className="flex items-center justify-between gap-2 md:justify-start">
          <CreateBaseVendor userId={session.user.id} />
          <Button className="px-3" size="sm">
            Add Product
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <LineChartComp />
        {/* <pre className="text-wrap text-xs">{JSON.stringify(session, null, 2)}</pre> */}

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
    </main>
  );
}
