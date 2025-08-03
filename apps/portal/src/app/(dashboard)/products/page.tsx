import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";

import { IconEmpty } from "@ziron/ui/assets/empty";
import { Badge } from "@ziron/ui/badge";
import { Button } from "@ziron/ui/button";

import { MainWrapper } from "@/components/layout/main-wrapper";
import { PageHeader } from "@/components/layout/page-header";
import { AddButton } from "@/components/ui/action-buttons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { hasPermission } from "@/modules/auth/actions/data-access";
import { getProducts, getProductsCount } from "@/modules/products/actions/queries";
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

  return (
    <MainWrapper>
      <PageHeader title="Products">
        <AddButton href="/products/new" title="Product" />
      </PageHeader>

      <Tabs className="w-full px-6" defaultValue="all">
        <TabsList className="flex h-auto w-full justify-between rounded-none border-b bg-transparent p-0">
          <div>
            <TabsTrigger
              className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
              value="all"
            >
              All
              <Suspense>
                <SuspendedProductsCount />
              </Suspense>
            </TabsTrigger>
            {/* <TabsTrigger
              value="published"
              className="data-[state=active]:after:bg-primary relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Published{" "}
              {activeProducts.length !== 0 && (
                <Badge>{activeProducts.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="drafts"
              className="data-[state=active]:after:bg-primary relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Drafts{" "}
              {draftProducts.length !== 0 && (
                <Badge>{draftProducts.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="archived"
              className="data-[state=active]:after:bg-primary relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Archived
              {archivedProducts.length !== 0 && (
                <Badge>{archivedProducts.length}</Badge>
              )}
            </TabsTrigger> */}
          </div>
        </TabsList>
        <div className="mb-2 flex items-center justify-between gap-3">
          {/* <Suspense>
            <ProductSearchInput collections={collections} />
          </Suspense> */}
        </div>

        <TabsContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3" value="all">
          <Suspense fallback={<div>Loading...</div>}>
            <SuspendedProducts />
          </Suspense>
        </TabsContent>
      </Tabs>
    </MainWrapper>
  );
}

async function SuspendedProducts() {
  const products = await getProducts();
  return products.length === 0 ? (
    <div className="col-span-full flex flex-col items-center justify-center py-12">
      <IconEmpty className="size-60" />
      <div className="mb-3 text-lg text-muted-foreground">No products found.</div>
      <Button asChild>
        <Link href="/products/new">Create your first product</Link>
      </Button>
    </div>
  ) : (
    products.map((product) => <ProductCard data={product} key={product.id} />)
  );
}

async function SuspendedProductsCount() {
  const count = await getProductsCount();
  return <Badge>{count}</Badge>;
}
