"use client";

import { IconAed } from "@ziron/ui/assets/currency";
import { Card, CardContent, CardHeader, CardTitle } from "@ziron/ui/card";
import { Checkbox } from "@ziron/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, useFormContext } from "@ziron/ui/form";
import { Input } from "@ziron/ui/input";
import { ProductFormType } from "@ziron/validators";
import { memo } from "react";
import { ShippingOption } from "./shipping-option";



export const ShippingHandlingCard = memo(function ShippingHandlingCard() {
  const { control, watch } = useFormContext<ProductFormType>();
  const isExpress = watch("delivery.type.express");
  const isReturnable = watch("delivery.returnable");

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Shipping & Handling</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ShippingOption
          name="delivery.cod"
          label="Cash on Delivery"
          description="Enable this if customers can pay in cash upon delivery."
        />
        <ShippingOption
          name="delivery.returnable"
          label="Returnable"
          description="Customers can return this product within the allowed return period."
          isChecked={!!isReturnable}
        >
          <FormField
            control={control}
            name="delivery.returnPeriod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Return Period</FormLabel>
                <FormControl className="-m-2 p-2">
                  <div className="relative">
                    <Input
                      {...field}
                      type="text"
                      placeholder="e.g. 14"
                      aria-label="Return period in days"
                      className="peer"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                    <span className="text-muted-foreground pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-sm peer-disabled:opacity-50">
                      Days
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </ShippingOption>
        <FormItem className="mt-4 space-y-2">
          <FormLabel>Delivery Type</FormLabel>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Checkbox checked disabled id="delivery-type-standard" />
              <FormLabel htmlFor="delivery-type-standard" className="mb-0">
                Standard Delivery
              </FormLabel>
            </div>
            <FormField
              control={control}
              name="delivery.type.express"
              render={({ field }) => (
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="delivery-type-express"
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                    aria-describedby={`delivery-type-express-description`}
                    aria-controls="delivery.deliveryType.fees"
                  />
                  <div className="grow">
                    <div className="grid gap-2">
                      <FormLabel
                        htmlFor="delivery-type-express"
                        className="flex-col items-start"
                      >
                        Express Delivery
                        <p
                          id={`delivery-type-express-description`}
                          className="text-muted-foreground text-xs font-normal"
                        >
                          Same-day or next-day delivery (additional charges
                          apply)
                        </p>
                      </FormLabel>
                    </div>
                  </div>
                </div>
              )}
            />

            <FormField
              control={control}
              name="delivery.type.fees"
              render={({ field }) => (
                <div
                  role="region"
                  id="delivery.type.fees"
                  aria-label="Additional delivery charges"
                  className="grid transition-all ease-in-out data-[state=collapsed]:grid-rows-[0fr] data-[state=collapsed]:opacity-0 data-[state=expanded]:grid-rows-[1fr] data-[state=expanded]:opacity-100"
                  data-state={isExpress ? "expanded" : "collapsed"}
                >
                  <div className="pointer-events-none -m-2 overflow-hidden p-2">
                    <div className="pointer-events-auto relative">
                      <Input
                        {...field}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Additional Delivery Charge"
                        aria-label="Additional Charges"
                        className="peer ps-8"
                      />
                      <span className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-sm peer-disabled:opacity-50">
                        <IconAed className="fill-muted-foreground size-3" />
                      </span>
                    </div>
                  </div>
                </div>
              )}
            />
          </div>
        </FormItem>
      </CardContent>
    </Card>
  );
});
