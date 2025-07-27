import { memo } from "react";


import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage, useFormContext
} from "@ziron/ui/form";
import { Switch } from "@ziron/ui/switch";
import { ProductFormType } from "@ziron/validators";

export const VariantSwitch = memo(function VariantSwitch() {
  const form = useFormContext<ProductFormType>();
  return (
    <FormField
      control={form.control}
      name="hasVariant"
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <div className="border-input dark:bg-input/30 hover:bg-input/20 dark:hover:bg-input/40 transition-colors has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                id={field.name}
                disabled={field.disabled}
                className="order-1 h-4 w-6 after:absolute after:inset-0 [&_span]:size-3 data-[state=checked]:[&_span]:translate-x-2 data-[state=checked]:[&_span]:rtl:-translate-x-2"
                aria-describedby={`has-variant-description`}
              />
              <div className="grid grow gap-2">
                <FormLabel>Enable Variants?</FormLabel>
                <p
                  id={`has-variant-description`}
                  className="text-muted-foreground text-xs"
                >
                  Enable if your product has multiple options like color or
                  storage.
                </p>
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
});
