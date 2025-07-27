"use client";

import { memo } from "react";

import { InfoTooltip } from "@/components/ui/tooltip";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ziron/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage, useFormContext
} from "@ziron/ui/form";
import { Input } from "@ziron/ui/input";
import { ProductFormType } from "@ziron/validators";

export const PhysicalSpecsCard = memo(function PhysicalSpecsCard() {
  const { control } = useFormContext<ProductFormType>();

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Physical Specs</CardTitle>
        <CardDescription>
          Real-world product size and physical weight for display and logistics.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="delivery.weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Weight</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Weight in gram"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="delivery.packageSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Package Dimensions{" "}
                <InfoTooltip info="Width x Height x Depth (cm)" />
              </FormLabel>
              <FormControl>
                <Input placeholder="eg. 10x20x30 cm" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
});
