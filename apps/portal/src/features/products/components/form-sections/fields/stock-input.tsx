"use client";

import { memo } from "react";

import { MinusIcon, PlusIcon } from "lucide-react";
import type { NumberFieldProps } from "react-aria-components";
import { Button, Group, Input, NumberField } from "react-aria-components";
import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { ProductFormType } from "../../../product-schema";

export const StockInputPrimitive = memo(function StockInputPrimitive(
  props: NumberFieldProps
) {
  return (
    <NumberField {...props}>
      <Group className="border-input data-[focus-within]:border-ring data-[focus-within]:ring-ring/50 data-[focus-within]:has-[[aria-invalid=true]]:ring-destructive/20 dark:data-[focus-within]:has-[[aria-invalid=true]]:ring-destructive/40 data-[focus-within]:has-[[aria-invalid=true]]:border-destructive relative inline-flex h-9 w-full items-center overflow-hidden rounded-md border text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none data-[disabled]:opacity-50 data-[focus-within]:ring-[3px]">
        <Button
          slot="decrement"
          className="border-input text-muted-foreground/80 hover:bg-accent hover:text-foreground -ms-px flex aspect-square h-[inherit] items-center justify-center rounded-s-md border bg-transparent text-sm transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MinusIcon size={16} aria-hidden="true" />
        </Button>
        <Input
          className="text-foreground w-full grow bg-transparent px-3 py-2 text-center tabular-nums"
          inputMode="numeric"
          pattern="[0-9]*"
        />
        <Button
          slot="increment"
          className="border-input text-muted-foreground/80 hover:bg-accent hover:text-foreground -me-px flex aspect-square h-[inherit] items-center justify-center rounded-e-md border bg-transparent text-sm transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <PlusIcon size={16} aria-hidden="true" />
        </Button>
      </Group>
    </NumberField>
  );
});

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
            <StockInputPrimitive
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
