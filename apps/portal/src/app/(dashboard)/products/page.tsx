import { MainWrapper } from "@/components/layout/main-wrapper";
import { PageHeader } from "@/components/layout/page-header";
import { AddButton } from "@/components/ui/action-buttons";
import { hasPermission } from "@/modules/auth/actions/data-access";

/**
 * Renders the Products page after verifying the user has the required permissions.
 *
 * Performs a permission check for creating, deleting, and updating products before displaying the page content.
 */
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
    </MainWrapper>
  );
}
