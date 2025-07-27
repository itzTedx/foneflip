"use client";


import { TabNavigation } from "@/components/ui/tab-navigation";
import { CollectionMetadata } from "@/features/collections/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ziron/ui/card";
import { useFormContext } from "@ziron/ui/form";
import { ProductFormType } from "@ziron/validators";
import { memo, useState } from "react";
import { CollectionDropdown } from "./fields/collections-dropdown";
import { ProductTitleInput } from "./fields/title-input";

interface Props {
  collections: CollectionMetadata[];
}

export const ProductDetails = memo(function ProductDetails({
  collections,
}: Props) {
  const [open, setOpen] = useState(false);
  const form = useFormContext<ProductFormType>();

  const hasVariant = form.watch("hasVariant");

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="px-2 text-lg font-medium">General Info</h2>
        <TabNavigation currentTab="info" />
      </div>
      <div className="relative grid grid-cols-1 gap-3 md:grid-cols-3">
        <Card className="col-span-2 h-fit">
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>
              Title and basic product description for storefront
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
          <ProductTitleInput />
            {/*   <ProductDescriptionEditor /> */}
          </CardContent>
        </Card>

        <div className="flex h-fit flex-col gap-3">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Classification</CardTitle>
              <CardDescription>
                Organize the product under brand and category, and assign
                identifiers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            <CollectionDropdown
                collections={collections}
                open={open}
                setOpen={setOpen}
            
              />
               {/*  <BrandInput />
              <ConditionSelector />
              <SlugInput /> */}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pricing Mode</CardTitle>
              <CardDescription>
                Choose how this product is priced and configured.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* <VariantSwitch /> */}
            </CardContent>
          </Card>
          {!hasVariant && (
            <Card>
              <CardHeader>
                <CardTitle>Default Pricing & Stock</CardTitle>
                <CardDescription>
                  Basic pricing for simple products.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {/* <SellingPriceInput />
                  <OriginalPriceInput /> */}
                </div>

                {/* <SkuInput />

                <StockInput /> */}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
});