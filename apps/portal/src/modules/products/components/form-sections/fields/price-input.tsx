import { memo } from "react";

import { IconAed } from "@ziron/ui/assets/currency";
import { FormControl, FormField, FormItem, FormLabel, useFormContext } from "@ziron/ui/form";
import { Input } from "@ziron/ui/input";
import { ProductFormType } from "@ziron/validators";

interface Props {
  name: "original" | "selling";
  label: string;
}

export const PriceInput = memo(function PriceInput({ name, label }: Props) {
  const form = useFormContext<ProductFormType>();
  return (
    <FormField
      control={form.control}
      name={`price.${name}`}
      render={({ field }) => (
        <FormItem>
          <FormLabel htmlFor={field.name}>{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                {...field}
                className="peer ps-6"
                id={field.name}
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="0.00"
              />
              <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 text-muted-foreground text-sm peer-disabled:opacity-50">
                <IconAed className="size-3 fill-muted-foreground" />
              </span>
            </div>
          </FormControl>
          {/* <FormMessage /> */}
        </FormItem>
      )}
    />
  );
});
