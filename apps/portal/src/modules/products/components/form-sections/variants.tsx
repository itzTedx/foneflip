"use client";

import { memo } from "react";

import { FormControl, FormField, FormItem, FormLabel, FormMessage, useFormContext } from "@ziron/ui/form";
import { Switch } from "@ziron/ui/switch";
import { ProductFormType } from "@ziron/validators";

import { TabNavigation } from "@/components/ui/tab-navigation";

import { ProductAttributes } from "./fields/attributes";
import { ProductVariantsList } from "./fields/variants-list";

interface Props {
  isEditMode: boolean;
  hasVariant?: boolean;
}

export const ProductVariants = memo(function ProductVariants({ isEditMode, hasVariant }: Props) {
  return (
    <>
      <div className="mb-3 flex h-full w-full items-center justify-between gap-3">
        <h2 className="relative z-20 px-2 font-medium text-lg">Variants & Attributes</h2>
        <TabNavigation className="relative z-20" currentTab="variants" />
        {!hasVariant && <VariantsDisabledOverlay />}
      </div>

      {hasVariant && (
        <div aria-disabled={!hasVariant} className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <ProductAttributes isEditMode={isEditMode} />
          <ProductVariantsList isEditMode={isEditMode} />
        </div>
      )}
    </>
  );
});

/**
 * Displays an overlay prompting the user to enable product variants when variants are currently disabled.
 *
 * The overlay explains that attributes and variant pricing require variants to be enabled, and provides a toggle switch bound to the form's `hasVariant` field for enabling variants directly.
 */
function VariantsDisabledOverlay() {
  const form = useFormContext<ProductFormType>();

  return (
    <div className="absolute inset-0 grid h-[calc(100dvh-8rem)] min-h-[20rem] place-content-center">
      <div className="z-20 max-w-sm rounded-lg border bg-background p-6 shadow-lg">
        <h3 className="text-center font-medium text-foreground text-xl">Variants Disabled</h3>
        <p className="mb-6 text-center text-muted-foreground text-xs">
          Attributes and variant pricing are only available when variants are enabled.
        </p>
        <FormField
          control={form.control}
          name="hasVariant"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative flex w-full items-start gap-2 rounded-md border border-input p-4 shadow-xs outline-none has-data-[state=checked]:border-primary/50">
                  <Switch
                    aria-describedby={"has-variant-description"}
                    checked={field.value}
                    className="data-[state=checked]:[&_span]:rtl:-translate-x-2 order-1 h-4 w-6 after:absolute after:inset-0 [&_span]:size-3 data-[state=checked]:[&_span]:translate-x-2"
                    disabled={field.disabled}
                    id={field.name}
                    onCheckedChange={field.onChange}
                  />
                  <div className="grid grow gap-2">
                    <FormLabel>Enable Variants?</FormLabel>
                    <p className="text-muted-foreground text-xs" id={"has-variant-description"}>
                      Enable if your product has multiple options like color or storage.
                    </p>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
