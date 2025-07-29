"use client";

import { memo } from "react";

import { IconAed } from "@ziron/ui/assets/currency";
import { Card, CardContent, CardHeader, CardTitle } from "@ziron/ui/card";
import { Checkbox } from "@ziron/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, useFormContext } from "@ziron/ui/form";
import { Input } from "@ziron/ui/input";
import { ProductFormType } from "@ziron/validators";

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
          description="Enable this if customers can pay in cash upon delivery."
          label="Cash on Delivery"
          name="delivery.cod"
        />
        <ShippingOption
          description="Customers can return this product within the allowed return period."
          isChecked={!!isReturnable}
          label="Returnable"
          name="delivery.returnable"
        >
          <FormField
            control={control}
            name="delivery.returnPeriod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Return Period</FormLabel>
                <FormControl className="-m-2 p-2">
                  <div className="relative">
                    {/* TODO: Fix the type error */}
                    <Input
                      {...field}
                      aria-label="Return period in days"
                      className="peer"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="e.g. 14"
                      type="text"
                    />
                    <span className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-muted-foreground text-sm peer-disabled:opacity-50">
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
              <FormLabel className="mb-0" htmlFor="delivery-type-standard">
                Standard Delivery
              </FormLabel>
            </div>
            <FormField
              control={control}
              name="delivery.type.express"
              render={({ field }) => (
                <div className="flex items-start gap-2">
                  <Checkbox
                    aria-controls="delivery.deliveryType.fees"
                    aria-describedby={"delivery-type-express-description"}
                    checked={!!field.value}
                    id="delivery-type-express"
                    onCheckedChange={field.onChange}
                  />
                  <div className="grow">
                    <div className="grid gap-2">
                      <FormLabel className="flex-col items-start" htmlFor="delivery-type-express">
                        Express Delivery
                        <p
                          className="font-normal text-muted-foreground text-xs"
                          id={"delivery-type-express-description"}
                        >
                          Same-day or next-day delivery (additional charges apply)
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
                  aria-label="Additional delivery charges"
                  className="grid transition-all ease-in-out data-[state=collapsed]:grid-rows-[0fr] data-[state=expanded]:grid-rows-[1fr] data-[state=collapsed]:opacity-0 data-[state=expanded]:opacity-100"
                  data-state={isExpress ? "expanded" : "collapsed"}
                  id="delivery.type.fees"
                  role="region"
                >
                  <div className="-m-2 pointer-events-none overflow-hidden p-2">
                    <div className="pointer-events-auto relative">
                      <Input
                        {...field}
                        aria-label="Additional Charges"
                        className="peer ps-8"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Additional Delivery Charge"
                      />
                      <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground text-sm peer-disabled:opacity-50">
                        <IconAed className="size-3 fill-muted-foreground" />
                      </span>
                    </div>
                  </div>
                  <FormMessage className="mt-1.5" />
                </div>
              )}
            />
          </div>
        </FormItem>
      </CardContent>
    </Card>
  );
});
