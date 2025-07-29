import { Button } from "@ziron/ui/button";

import { MainWrapper } from "@/components/layout/main-wrapper";
import { PageHeader } from "@/components/layout/page-header";
import { AddButton } from "@/components/ui/action-buttons";
import { hasPermission } from "@/modules/auth/actions/data-access";

export default async function ProductsPage() {
  await hasPermission({
    permissions: {
      products: ["create", "delete", "update"],
    },
  });
  return (
    <MainWrapper>
      <PageHeader title="Products">
        <AddButton href="/products/new" title="Product" />
      </PageHeader>
      <div>
        <Button />
      </div>
    </MainWrapper>
  );
}
