"use client";

import { TabNavigation } from "@/components/ui/tab-navigation";
import { CollectionMetadata } from "@/modules/collections/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ziron/ui/card";
import { useFormContext } from "@ziron/ui/form";
import { LabelAsterisk } from "@ziron/ui/label";
import { ProductFormType } from "@ziron/validators";
import { memo } from "react";
import { BrandInput } from "./fields/brand-input";
import { CollectionDropdown } from "./fields/collections-dropdown";
import { ConditionSelector } from "./fields/condition-selector";
import { PriceInput } from "./fields/price-input";
import { SkuInput } from "./fields/sku-input";
import { SlugInput } from "./fields/slug-input";
import { StockInput } from "./fields/stock-input";
import { ProductTitleInput } from "./fields/title-input";
import { VariantSwitch } from "./fields/variant-switch";

interface Props {
  collections: CollectionMetadata[];
}

export const ProductInfo = memo(function ProductInfo({
  collections,
}: Props) {
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

        {/* Classification Section */}
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
              <CollectionDropdown collections={collections} />
              <BrandInput />
              <ConditionSelector />
              <SlugInput />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pricing Mode <LabelAsterisk /></CardTitle>
              <CardDescription>
                Choose how this product is priced and configured.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VariantSwitch />
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
                   <PriceInput name="selling" label="Selling Price"  />
                   <PriceInput name="original" label="Original Price"  />
                </div>
                
                <SkuInput />             
                <StockInput /> 
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
});