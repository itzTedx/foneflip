import { MainWrapper } from "@/components/layout/main-wrapper";
import { getUsers } from "@/features/users/actions/queries";
import UsersTable from "@/features/users/components/table/data-table";

export default async function UsersPage() {
  const users = await getUsers();
  return (
    <MainWrapper className="py-6">
      <UsersTable data={users} />
    </MainWrapper>
  );
}
