import { Suspense } from "react";
import { Metadata } from "next";
import { cookies } from "next/headers";

import { MainWrapper } from "@/components/layout/main-wrapper";
import { PageHeader } from "@/components/layout/page-header";
import { ExportButton } from "@/components/ui/action-buttons";
import { hasPermission } from "@/modules/auth/actions/data-access";
import { getUsers } from "@/modules/users/actions/queries";
import UsersTable from "@/modules/users/components/table/data-table";

export const metadata: Metadata = {
  title: "Manage Users | Foneflip",
  description: "Browse and manage user accounts.",
};

export default async function UsersPage() {
  await hasPermission({
    permissions: {
      user: ["list", "ban", "impersonate", "set-password", "set-role", "create"],
    },
  });

  return (
    <MainWrapper>
      <PageHeader
        badge={
          <Suspense>
            <SuspendedUsersCount />
          </Suspense>
        }
        title="Manage Users"
      >
        {" "}
        <ExportButton />
      </PageHeader>
      <Suspense fallback={<div>Loading...</div>}>
        <SuspendedTable />
      </Suspense>
    </MainWrapper>
  );
}

export async function SuspendedTable() {
  const users = await getUsers();
  const cookieStore = await cookies();
  const pageSizeCookie = cookieStore.get("users_table_pageSize")?.value;

  return <UsersTable data={users} initialPageSize={pageSizeCookie ? Number(pageSizeCookie) : undefined} />;
}

async function SuspendedUsersCount() {
  const users = await getUsers();
  return `${users.length} Users`;
}
