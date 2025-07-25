import type { Metadata } from "next";
import { requireUser } from "@/features/auth/actions/data-access";

import { TabsContent } from "@ziron/ui/components/tabs";

import { ProfileForm } from "./profile-form";

export const metadata: Metadata = {
  title: "Profile Settings | Foneflip",
  description: "Browse and manage your media assets.",
};

export default async function ProfileSettingsPage() {
  const session = await requireUser();

  // const sessions = await getUserSessions(session.user.id);

  //   const sessions = await authClient.listSessions();
  // console.log(sessions);

  return (
    <TabsContent value="profile">
      <ProfileForm initialData={session} />
    </TabsContent>
  );
}
