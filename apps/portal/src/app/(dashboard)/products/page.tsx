import { Metadata } from "next";

import { MainWrapper } from "@/components/layout/main-wrapper";
import { PageHeader } from "@/components/layout/page-header";
import { AddButton } from "@/components/ui/action-buttons";
import { hasPermission } from "@/modules/auth/actions/data-access";
import { getProducts } from "@/modules/products/actions/queries";
import { ProductCard } from "@/modules/products/components/ui/product-card";

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

  const products = await getProducts();
  return (
    <MainWrapper>
      <PageHeader title="Products">
        <AddButton href="/products/new" title="Product" />
      </PageHeader>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {products.map((product) => (
          <ProductCard data={product} key={product.id} />
        ))}
      </div>
    </MainWrapper>
  );
}
