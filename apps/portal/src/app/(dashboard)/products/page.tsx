import { MainWrapper } from "@/components/layout/main-wrapper";
import { PageHeader } from "@/components/layout/page-header";
import { AddButton } from "@/components/ui/action-buttons";

export default function ProductsPage() {
  return (
    <MainWrapper>
      <PageHeader title="Products">
        <AddButton title="Product" href="/products/new" />
      </PageHeader>
    </MainWrapper>
  );
}
