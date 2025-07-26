import { MainWrapper } from "@/components/layout/main-wrapper";
import { PageHeader } from "@/components/layout/page-header";
import { AddButton } from "@/components/ui/action-buttons";
import { hasPermission } from "@/features/auth/actions/data-access";

export default async function ProductsPage() {
  await hasPermission({
    permissions: {
      products: ["create", "delete", "update"]
    }
  });
  return (
    <MainWrapper>
      <PageHeader title="Products">
        <AddButton title="Product" href="/products/new" />
      </PageHeader>
    </MainWrapper>
  );
}
