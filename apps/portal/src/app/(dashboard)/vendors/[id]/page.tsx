import { Metadata } from "next";
import { notFound } from "next/navigation";

import { IconSettings2 } from "@tabler/icons-react";

import { IconEmpty } from "@ziron/ui/assets/empty";
import { Button } from "@ziron/ui/button";

import { MainWrapper } from "@/components/layout/main-wrapper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProductsByVendorId } from "@/modules/products/actions/queries";
import { ProductCard } from "@/modules/products/components/ui/product-card";
import { getVendorById } from "@/modules/vendors/actions/queries";
import { VendorProfileCard } from "@/modules/vendors/components/ui/profile-card";
import VendorActions from "@/modules/vendors/components/ui/vendor-actions";
import { VendorDetails } from "@/modules/vendors/components/ui/vendor-details";
import { PersonalInfoCard } from "@/modules/vendors/components/ui/vendor-info";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const vendor = await getVendorById(id);

  if (vendor && vendor.success && vendor.data) {
    const title = vendor.data.businessName
      ? `${vendor.data.businessName} - Vendor Details | Foneflip`
      : "Vendor Details | Foneflip";
    const description = `Business: ${vendor.data.businessName || "N/A"}. Category: ${vendor.data.businessCategory || "N/A"}. Website: ${vendor.data.website || "N/A"}.`;

    return {
      title,
      description,
    };
  }
  return {
    title: "Vendor Not Found | Foneflip",
    description: "This vendor does not exist or was removed.",
    robots: { index: false, follow: false },
  };
}

export default async function VendorDashboard({ params }: { params: Params }) {
  const { id } = await params;

  const vendor = await getVendorById(id);

  if (!vendor.success || !vendor.data) {
    return notFound();
  }

  const products = await getProductsByVendorId(id);

  return (
    <MainWrapper className="px-4 md:px-6">
      <div className="flex items-center justify-between">
        <VendorProfileCard vendor={vendor.data} />
        <VendorActions vendor={vendor.data} />
      </div>
      <Tabs className="w-full" defaultValue="info">
        <TabsList className="mb-2 flex h-auto w-full justify-between rounded-none border-b bg-transparent p-0">
          <div>
            <TabsTrigger
              className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
              value="info"
            >
              Information
            </TabsTrigger>
            <TabsTrigger
              className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
              value="products"
            >
              Products
            </TabsTrigger>
            <TabsTrigger
              className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
              value="transaction"
            >
              Transaction
            </TabsTrigger>
            <TabsTrigger
              className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
              value="archived"
            >
              Archived
            </TabsTrigger>
          </div>
          <div className="flex items-center justify-between">
            <Button size="sm" variant="ghost">
              <IconSettings2 /> Settings
            </Button>
          </div>
        </TabsList>

        <TabsContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4" value="info">
          <VendorDetails vendor={vendor.data} />
          <PersonalInfoCard vendor={vendor.data} />
        </TabsContent>
        <TabsContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3" value="products">
          {products.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <IconEmpty className="mb-4 size-60" />
              <div className="text-lg text-muted-foreground">No products found.</div>
            </div>
          ) : (
            products.map((product) => <ProductCard data={product} key={product.id} showAction={false} />)
          )}
        </TabsContent>
      </Tabs>
    </MainWrapper>
  );
}
