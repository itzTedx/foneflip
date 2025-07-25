import { cookies } from "next/headers";
import { MainWrapper } from "@/components/layout/main-wrapper";
import { PageHeader } from "@/components/layout/page-header";
import { ExportButton } from "@/components/ui/action-buttons";
import { getUsers } from "@/features/users/actions/queries";
import UsersTable from "@/features/users/components/table/data-table";

export default async function UsersPage() {
  const users = await getUsers();
  const cookieStore = await cookies();
  const pageSizeCookie = cookieStore.get("users_table_pageSize")?.value;
  return (
    <MainWrapper>
      <PageHeader title="Manage Users" badge={`${users.length} Users`}>
        <ExportButton />
      </PageHeader>
      <UsersTable
        data={users}
        initialPageSize={pageSizeCookie ? Number(pageSizeCookie) : undefined}
      />
    </MainWrapper>
  );
}
