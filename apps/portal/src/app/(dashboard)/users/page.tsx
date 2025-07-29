import { MainWrapper } from "@/components/layout/main-wrapper";
import { PageHeader } from "@/components/layout/page-header";
import { ExportButton } from "@/components/ui/action-buttons";
import { getUsers } from "@/modules/users/actions/queries";
import UsersTable from "@/modules/users/components/table/data-table";
import { cookies } from "next/headers";

/**
 * Renders the users management page with a table of users and related controls.
 *
 * Retrieves user data and the preferred table page size from cookies, then displays the users table along with page header and export functionality.
 */
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
