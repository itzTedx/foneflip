import { Metadata } from "next";

import { MainWrapper } from "@/components/layout/main-wrapper";
import { PageHeader } from "@/components/layout/page-header";
import { AddButton } from "@/components/ui/action-buttons";
import { hasPermission } from "@/modules/auth/actions/data-access";
import { TestButton } from "@/modules/media/components/test-button";

export const metadata: Metadata = {
  title: "Manage Products | Foneflip",
  description: "Browse, add, and manage your products.",
};

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
        <TestButton />
      </div>
    </MainWrapper>
  );
}
