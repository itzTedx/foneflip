import { cookies } from "next/headers";
import { MainWrapper } from "@/components/layout/main-wrapper";
import { getUsers } from "@/features/users/actions/queries";
import UsersTable from "@/features/users/components/table/data-table";

export default async function UsersPage() {
  const users = await getUsers();
  const cookieStore = await cookies();
  const pageSizeCookie = cookieStore.get("users_table_pageSize")?.value;
  return (
    <MainWrapper className="py-6">
      <UsersTable
        data={users}
        initialPageSize={pageSizeCookie ? Number(pageSizeCookie) : undefined}
      />
    </MainWrapper>
  );
}
