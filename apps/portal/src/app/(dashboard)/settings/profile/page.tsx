import { requireUser } from "@/modules/auth/actions/data-access";
import type { Metadata } from "next";

import { TabsContent } from "@ziron/ui/tabs";

import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = {
  title: "Profile Settings | Foneflip",
  description: "Browse and manage your media assets.",
};

/**
 * Renders the profile settings page for an authenticated user.
 *
 * Ensures the user is authenticated, retrieves their active sessions, and displays the profile form within the profile tab.
 */
export default async function ProfileSettingsPage() {
  const session = await requireUser();

  // const sessions = await getUserSessions(session.user.id);
  const header = await headers();

  const sessions = await auth.api.listSessions({
    headers: header,
  });
  // console.log(sessions);

  return (
    <TabsContent value="profile">
      <ProfileForm initialData={session} sessions={sessions} />
    </TabsContent>
  );
}
