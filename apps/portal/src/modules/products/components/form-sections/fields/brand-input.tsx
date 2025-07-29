import { memo } from "react";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormContext,
} from "@ziron/ui/form";
import { Input } from "@ziron/ui/input";
import { ProductFormType } from "@ziron/validators";

import { InfoTooltip } from "@/components/ui/tooltip";

export const BrandInput = memo(function BrandInput() {
  const form = useFormContext<ProductFormType>();
  return (
    <FormField
      control={form.control}
      name="brand"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            Brand
            <InfoTooltip info="Optional: Enter the brand name to categorize the product and improve search and SEO." />
          </FormLabel>
          <FormControl>
            <Input {...field} placeholder="Brand" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
});
