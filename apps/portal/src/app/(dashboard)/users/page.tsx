import { cookies } from "next/headers";
import { MainWrapper } from "@/components/layout/main-wrapper";
import { PageHeader } from "@/components/layout/page-header";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { getUsers } from "@/features/users/actions/queries";
import UsersTable from "@/features/users/components/table/data-table";
import { IconFileExport } from "@tabler/icons-react";

import { Button } from "@ziron/ui/components/button";

export default async function UsersPage() {
  const users = await getUsers();
  const cookieStore = await cookies();
  const pageSizeCookie = cookieStore.get("users_table_pageSize")?.value;
  return (
    <MainWrapper>
      <PageHeader title="Manage Users" badge={`${users.length} Users`}>
        <ThemeSwitcher />
        <Button>
          <IconFileExport /> Export
        </Button>
      </PageHeader>
      <UsersTable
        data={users}
        initialPageSize={pageSizeCookie ? Number(pageSizeCookie) : undefined}
      />
    </MainWrapper>
  );
}
