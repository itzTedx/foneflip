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
import { NumberInput } from "@ziron/ui/input";
import { ProductFormType } from "@ziron/validators";

export const StockInput = memo(function StockInput() {
  const form = useFormContext<ProductFormType>();
  return (
    <FormField
      control={form.control}
      name="stock"
      render={({ field }) => (
        <FormItem>
          <FormLabel htmlFor={field.name}>Stock</FormLabel>
          <FormControl>
            <NumberInput
              {...field}
              defaultValue={field.value}
              onChange={field.onChange}
              minValue={0}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
});
