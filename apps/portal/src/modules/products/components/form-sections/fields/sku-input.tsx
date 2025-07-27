import { memo } from "react";

import { IconSparkles } from "@tabler/icons-react";

import { generateSKU } from "@/lib/functions/generate-sku";
import { Button } from "@ziron/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage, useFormContext
} from "@ziron/ui/form";
import { Input } from "@ziron/ui/input";
import { ProductFormType } from "@ziron/validators";


export const SkuInput = memo(function SkuInput() {
  const form = useFormContext<ProductFormType>();

  const handleGenerateSku = () => {
    form.clearErrors("sku");

    const title = form.getValues("title");
    const brand = form.getValues("brand");
    const condition = form.getValues("condition");

    if (!title?.trim()) {
      form.setError("sku", {
        message: "Please enter a title first",
      });
      return;
    }
    if (!brand?.trim()) {
      form.setError("sku", {
        message: "Please enter a brand first",
      });
      return;
    }
    if (!condition?.trim()) {
      form.setError("sku", {
        message: "Please enter a condition first",
      });
      return;
    }

    try {
      const sku = generateSKU(brand, title, condition);
      form.setValue("sku", sku, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } catch (error) {
      form.setError("sku", {
        message: "Failed to generate sku. Please try again.",
      });
      console.log(error);
    }
  };

  return (
    <FormField
      control={form.control}
      name="sku"
      render={({ field }) => (
        <FormItem>
          <FormLabel htmlFor={field.name}>SKU</FormLabel>
          <FormControl>
            <div className="flex rounded-md shadow-xs">
              <Input
                {...field}
                id={field.name}
                className="-me-px flex-1 rounded-e-none shadow-none focus-visible:z-10"
                placeholder="APP-16-PM-BL"
              />
               <Button
                type="button"
                variant="outline"
                className="rounded-s-none"
                onClick={handleGenerateSku}
              >
                <IconSparkles className="h-4 w-4" />
                Generate
              </Button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
});
