"use client";

import { memo } from "react";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormContext,
} from "@ziron/ui/form";
import { Switch } from "@ziron/ui/switch";
import { ProductFormType } from "@ziron/validators";

interface ShippingOptionProps {
  name: "delivery.cod" | "delivery.returnable";
  label: string;
  description: string;
  isChecked?: boolean;
  children?: React.ReactNode;
}

export const ShippingOption = memo(function ShippingOption({
  name,
  label,
  description,
  isChecked,
  children,
}: ShippingOptionProps) {
  const { control } = useFormContext<ProductFormType>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <div className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full flex-col gap-2 rounded-md border p-4 shadow-xs outline-none">
              <div className="flex items-start gap-2">
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="order-1 h-4 w-6 after:absolute after:inset-0 [&_span]:size-3 data-[state=checked]:[&_span]:translate-x-2 data-[state=checked]:[&_span]:rtl:-translate-x-2"
                  aria-describedby={`${field.name}-description`}
                />
                <div className="grid grow gap-2">
                  <FormLabel>{label}</FormLabel>
                  <p
                    id={`${field.name}-description`}
                    className="text-muted-foreground text-xs"
                  >
                    {description}
                  </p>
                </div>
              </div>
              <div
                data-state={isChecked ? "expanded" : "collapsed"}
                className="grid transition-all ease-in-out data-[state=collapsed]:-mt-4 data-[state=collapsed]:grid-rows-[0fr] data-[state=collapsed]:opacity-0 data-[state=expanded]:grid-rows-[1fr] data-[state=expanded]:opacity-100"
              >
                <div className="-m-2 overflow-hidden p-2">
                  <div className="pt-2">{children}</div>
                </div>
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
});
