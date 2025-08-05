import type { Metadata } from "next";
import { headers } from "next/headers";

import { TabsContent } from "@ziron/ui/tabs";

import { auth } from "@/lib/auth/server";
import { requireUser } from "@/modules/auth/actions/data-access";

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

  const header = await headers();

  const activeSessions = await auth.api.listSessions({
    headers: header,
  });

  return (
    <TabsContent value="profile">
      <ProfileForm activeSessions={activeSessions} initialData={session} />
    </TabsContent>
  );
}
