import { memo } from "react";

import { IconAed } from "@ziron/ui/assets/currency";
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

interface Props {
  name: "original" | "selling"
  label: string
}

export const PriceInput = memo(function PriceInput({name, label}: Props) {
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
                id={field.name}
                className="peer ps-6"
                placeholder="0.00"
                inputMode="numeric"
                pattern="[0-9]*"
              />
              <span className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 text-sm peer-disabled:opacity-50">
                <IconAed className="fill-muted-foreground size-3" />
              </span>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
});
