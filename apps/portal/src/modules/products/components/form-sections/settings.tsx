"use client";

import { memo } from "react";

import { IconSpeakerphone } from "@tabler/icons-react";

import { ActionButton } from "@/components/ui/action-buttons";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormContext,
} from "@ziron/ui/form";
import { Input } from "@ziron/ui/input";
import { MultiInput } from "@ziron/ui/multi-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ziron/ui/select";
import { Switch } from "@ziron/ui/switch";
import { Textarea } from "@ziron/ui/textarea";
import { cn } from "@ziron/utils";
import { ProductFormType, productStatusEnum } from "@ziron/validators";



const serverAction = async () => {
  // Simulate a server action
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { error: false };
};

export const ProductSettings = memo(function ProductSettings() {
  const form = useFormContext<ProductFormType>();

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="px-2 text-lg font-medium">Product Settings</h2>
        <ActionButton action={serverAction}>Save Settings</ActionButton>
      </div>

      <div className="gap-3 space-y-3 md:columns-2">
        <Card className="h-fit break-inside-avoid">
          <CardHeader>
            <CardTitle>Visibility & status</CardTitle>
            <CardDescription>
              Manage whether the product is publicly visible, in draft, or
              archived.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="settings.status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor={field.name}>
                    Status{" "}
                    <InfoTooltip info="Control whether the product is live, in draft, or archived." />
                  </FormLabel>
                  <FormControl>
                    <Select
                      defaultValue={productStatusEnum.enum.draft}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        id={field.name}
                        className="min-w-32 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0"
                      >
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent
                        position="item-aligned"
                       
                      >
                        {productStatusEnum.options.map((status) => (
                          <SelectItem value={status} key={status}>
                            <span className="flex items-center gap-2">
                              <StatusDot
                                className={cn(
                                  "size-2",
                                  status === "active" && "text-emerald-600",
                                  status === "draft" && "text-muted-foreground",
                                  status === "archived" && "text-destructive"
                                )}
                              />
                              <span className="truncate capitalize">
                                {status}
                              </span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="settings.visible"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        onBlur={field.onBlur}
                        disabled={field.disabled}
                        className="order-1 h-4 w-6 after:absolute after:inset-0 [&_span]:size-3 data-[state=checked]:[&_span]:translate-x-2 data-[state=checked]:[&_span]:rtl:-translate-x-2"
                      />
                      <div className="grid grow gap-2">
                        <FormLabel htmlFor={field.name}>Visibility</FormLabel>
                        <FormDescription className="text-muted-foreground text-xs">
                          Show or hide this product from the storefront.
                        </FormDescription>
                      </div>
                    </div>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        <Card className="h-fit break-inside-avoid">
          <CardHeader>
            <CardTitle>Customer Interactions</CardTitle>
            <CardDescription>
            Configure how customers can interact with this product.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="settings.allowReviews"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        onBlur={field.onBlur}
                        disabled={field.disabled}
                        className="order-1 h-4 w-6 after:absolute after:inset-0 [&_span]:size-3 data-[state=checked]:[&_span]:translate-x-2 data-[state=checked]:[&_span]:rtl:-translate-x-2"
                      />
                      <div className="grid grow gap-2">
                        <FormLabel htmlFor={field.name}>
                          Allow product reviews
                        </FormLabel>
                        <FormDescription className="text-muted-foreground text-xs">
                          Let customers leave ratings and feedback.
                        </FormDescription>
                      </div>
                    </div>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="settings.allowBackorders"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        onBlur={field.onBlur}
                        disabled={field.disabled}
                        className="order-1 h-4 w-6 after:absolute after:inset-0 [&_span]:size-3 data-[state=checked]:[&_span]:translate-x-2 data-[state=checked]:[&_span]:rtl:-translate-x-2"
                      />
                      <div className="grid grow gap-2">
                        <FormLabel htmlFor={field.name}>
                          Allow backorders
                        </FormLabel>
                        <FormDescription className="text-muted-foreground text-xs">
                          Allow purchase even if item is out of stock.
                        </FormDescription>
                      </div>
                    </div>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="settings.showStockStatus"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        onBlur={field.onBlur}
                        disabled={field.disabled}
                        className="order-1 h-4 w-6 after:absolute after:inset-0 [&_span]:size-3 data-[state=checked]:[&_span]:translate-x-2 data-[state=checked]:[&_span]:rtl:-translate-x-2"
                      />
                      <div className="grid grow gap-2">
                        <FormLabel htmlFor={field.name}>
                          Show stock status
                        </FormLabel>
                        <FormDescription className="text-muted-foreground text-xs">
                          Display live stock info on the product page.
                        </FormDescription>
                      </div>
                    </div>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        <Card className="h-fit break-inside-avoid">
          <CardHeader>
            <CardTitle>Display Settings</CardTitle>
            <CardDescription>
              Adjust how the product is visually and interactively presented.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="settings.featured"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        onBlur={field.onBlur}
                        disabled={field.disabled}
                        className="order-1 h-4 w-6 after:absolute after:inset-0 [&_span]:size-3 data-[state=checked]:[&_span]:translate-x-2 data-[state=checked]:[&_span]:rtl:-translate-x-2"
                      />
                      <div className="grid grow gap-2">
                        <FormLabel htmlFor={field.name}>
                          Featured product
                        </FormLabel>
                        <FormDescription className="text-muted-foreground text-xs">
                          Highlight on homepage or special collections.
                        </FormDescription>
                      </div>
                    </div>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="settings.hidePrice"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        onBlur={field.onBlur}
                        disabled={field.disabled}
                        className="order-1 h-4 w-6 after:absolute after:inset-0 [&_span]:size-3 data-[state=checked]:[&_span]:translate-x-2 data-[state=checked]:[&_span]:rtl:-translate-x-2"
                      />
                      <div className="grid grow gap-2">
                        <FormLabel htmlFor={field.name}>Hide price</FormLabel>
                        <FormDescription className="text-muted-foreground text-xs">
                          Hide pricing and show “Contact Us” or “Login to view”
                          instead.
                        </FormDescription>
                      </div>
                    </div>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="settings.customCTA"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor={field.name}>
                    Call-to-action button
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        id={field.name}
                        className="peer pe-9"
                        placeholder="Buy Now"
                        type="text"
                      />
                      <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 peer-disabled:opacity-50">
                        <IconSpeakerphone size={16} aria-hidden="true" />
                      </div>
                    </div>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        <Card className="h-fit break-inside-avoid">
          <CardHeader>
            <CardTitle>Tagging & Metadata</CardTitle>
            <CardDescription>
              Help internal teams manage and find products easily.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
          <FormField
              control={form.control}
              name="settings.tags"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <MultiInput
                      label="Tags"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>
                    Add keywords for internal search/sorting (e.g., trending,
                    clearance)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="settings.internalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor={field.name}>Internal notes</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Textarea
                        {...field}
                        id={field.name}
                        className="peer pe-9"
                        placeholder="e.g., Imported on June batch, supplier: TechSource Ltd."
                      />
                      <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 peer-disabled:opacity-50">
                        <IconSpeakerphone size={16} aria-hidden="true" />
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Private notes for admins only (e.g., batch info, supplier
                    notes)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
});

export function StatusDot({ className }: { className?: string }) {
  return (
    <svg
      width="8"
      height="8"
      fill="currentColor"
      viewBox="0 0 8 8"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="4" cy="4" r="4" />
    </svg>
  );
}
