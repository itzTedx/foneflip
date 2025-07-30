import { Metadata } from "next";
import Link from "next/link";

import { Card, CardContent } from "@ziron/ui/card";

import { MainWrapper } from "@/components/layout/main-wrapper";
import { PageHeader } from "@/components/layout/page-header";
import { AddButton } from "@/components/ui/action-buttons";
import { hasPermission } from "@/modules/auth/actions/data-access";
import { getProducts } from "@/modules/products/actions/queries";

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
      <div className=" grid grid-cols-3 gap-4">
        {products.map((product) => (
          <Card className="relative" key={product.id}>
            <Link
              className="absolute inset-0 z-0"
              href={`/products/${product.id}?title=${product.title.replace(" ", "+")}`}
            />
            <CardContent>{product.title}</CardContent>
          </Card>
        ))}
      </div>
    </MainWrapper>
  );
}
