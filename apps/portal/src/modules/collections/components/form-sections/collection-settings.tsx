"use client";

import { memo } from "react";
import Image from "next/image";

import { IconSpeakerphone } from "@tabler/icons-react";
import { CheckIcon, MinusIcon } from "lucide-react";

import { IconDot } from "@ziron/ui/assets/icons";
import { Button } from "@ziron/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@ziron/ui/card";
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
import { RadioGroup, RadioGroupItem } from "@ziron/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ziron/ui/select";
import { Switch } from "@ziron/ui/switch";
import { Textarea } from "@ziron/ui/textarea";
import { cn, formatDate } from "@ziron/utils";
import { CollectionFormType, collectionStatusEnum } from "@ziron/validators";

import { TabNavigation } from "@/components/ui/tab-navigation";
import { InfoTooltip } from "@/components/ui/tooltip";

const layouts = [
  {
    layout: "Slider / Carousel",
    value: "slider",
    image: "/images/ui/layout-carousel.jpg",
  },
  {
    layout: "Grid",
    value: "grid",
    image: "/images/ui/layout-grid.jpg",
  },
];

interface Props {
  isEditMode: boolean;
  updatedAt?: Date;
}

export const CollectionSettings = memo(function CollectionSettings({ isEditMode, updatedAt }: Props) {
  const form = useFormContext<CollectionFormType>();
  const thumbnail = form.getValues("thumbnail");
  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="px-2 font-medium text-lg">Collection Settings</h2>
        <TabNavigation currentTab="seo" type="collections" />
      </div>
      <div className="gap-3 space-y-3 md:columns-2">
        <Card className="h-fit break-inside-avoid">
          <CardHeader>
            <CardTitle>Visibility & status</CardTitle>
            <CardDescription>Manage whether the collection is publicly visible, in draft, or archived.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="settings.status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor={field.name}>
                    Status{" "}
                    <InfoTooltip info="Determines the collection's visibility status. New collections default to 'active', while saving as a draft sets the status to 'draft'." />
                  </FormLabel>
                  <FormControl>
                    <Select
                      defaultValue={collectionStatusEnum.enum.draft}
                      disabled
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger
                        className="min-w-32 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0"
                        id={field.name}
                      >
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent
                        className="[&_*[role=option]>span>svg]:shrink-0 [&_*[role=option]>span>svg]:text-muted-foreground/80 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8"
                        position="item-aligned"
                      >
                        {collectionStatusEnum.options.map((status) => (
                          <SelectItem key={status} value={status}>
                            <span className="flex items-center gap-2">
                              <IconDot
                                className={cn(
                                  "size-2",
                                  status === "active" && "text-emerald-600",
                                  status === "draft" && "text-muted-foreground",
                                  status === "archived" && "text-destructive"
                                )}
                              />
                              <span className="truncate capitalize">{status}</span>
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
              name="settings.showInNav"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative flex w-full items-start gap-2 rounded-md border border-input p-4 shadow-xs outline-none has-data-[state=checked]:border-primary/50">
                      <Switch
                        checked={field.value}
                        className="data-[state=checked]:[&_span]:rtl:-translate-x-2 order-1 h-4 w-6 after:absolute after:inset-0 [&_span]:size-3 data-[state=checked]:[&_span]:translate-x-2"
                        disabled={field.disabled}
                        onBlur={field.onBlur}
                        onCheckedChange={field.onChange}
                      />
                      <div className="grid grow gap-2">
                        <FormLabel htmlFor={field.name}>Show in navbar</FormLabel>
                        <FormDescription className="text-muted-foreground text-xs">
                          Show or hide this collection from the storefront navbar.
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
            <CardTitle>Layout customization</CardTitle>
            <CardDescription>
              Customize the layout style and control whether a banner appears on the storefront homepage.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="settings.layout"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor={field.name}>
                    Layout style{" "}
                    <InfoTooltip info="Choose between a Slider / Carousel layout for a scrolling view or a Grid layout for a static tile-based presentation." />
                  </FormLabel>
                  <FormControl>
                    <RadioGroup className="flex gap-3" defaultValue={field.value}>
                      {layouts.map((item, id) => (
                        <label key={`${id}-${item.value}`}>
                          <RadioGroupItem
                            className="peer sr-only after:absolute after:inset-0"
                            id={`${id}-${item.value}`}
                            onClick={() => field.onChange(item.value)}
                            value={item.value}
                          />
                          <Image
                            alt={item.layout}
                            className="relative cursor-pointer overflow-hidden rounded-md border border-input shadow-xs outline-none transition-[color,box-shadow] peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50 peer-data-disabled:cursor-not-allowed peer-data-[state=checked]:border-ring peer-data-[state=checked]:bg-accent peer-data-disabled:opacity-50"
                            height={120}
                            src={item.image}
                            width={180}
                          />
                          <span className="group mt-2 flex items-center gap-1 peer-data-[state=unchecked]:text-muted-foreground/70">
                            <CheckIcon
                              aria-hidden="true"
                              className="group-peer-data-[state=unchecked]:hidden"
                              size={16}
                            />
                            <MinusIcon
                              aria-hidden="true"
                              className="group-peer-data-[state=checked]:hidden"
                              size={16}
                            />
                            <span className="font-medium text-xs">{item.layout}</span>
                          </span>
                        </label>
                      ))}
                    </RadioGroup>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="settings.showBanner"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative flex w-full items-start gap-2 rounded-md border border-input p-4 shadow-xs outline-none has-data-[state=checked]:border-primary/50">
                      <Switch
                        checked={field.value}
                        className="data-[state=checked]:[&_span]:rtl:-translate-x-2 order-1 h-4 w-6 after:absolute after:inset-0 [&_span]:size-3 data-[state=checked]:[&_span]:translate-x-2"
                        disabled={field.disabled}
                        onBlur={field.onBlur}
                        onCheckedChange={field.onChange}
                      />
                      <div className="grid grow gap-2">
                        <FormLabel htmlFor={field.name}>Show banner</FormLabel>
                        <FormDescription className="text-muted-foreground text-xs">
                          Show or hide banner for this collection in storefront homepage.
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
            <CardDescription>Adjust how the product is visually and interactively presented.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="settings.showLabel"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative flex w-full items-start gap-2 rounded-md border border-input p-4 shadow-xs outline-none has-data-[state=checked]:border-primary/50">
                      <Switch
                        checked={field.value}
                        className="data-[state=checked]:[&_span]:rtl:-translate-x-2 order-1 h-4 w-6 after:absolute after:inset-0 [&_span]:size-3 data-[state=checked]:[&_span]:translate-x-2"
                        disabled={field.disabled}
                        onBlur={field.onBlur}
                        onCheckedChange={field.onChange}
                      />
                      <div className="grid grow gap-2">
                        <FormLabel htmlFor={field.name}>Show label</FormLabel>
                        <FormDescription className="text-muted-foreground text-xs">
                          Show or hide this collection label from the storefront collection tile.
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
                  <FormLabel htmlFor={field.name}>Call-to-action button</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input {...field} className="peer pe-9" id={field.name} placeholder="Buy Now" type="text" />
                      <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-muted-foreground/80 peer-disabled:opacity-50">
                        <IconSpeakerphone aria-hidden="true" size={16} />
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
            <CardDescription>Help internal teams manage and find products easily.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="settings.tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tags <InfoTooltip info="Add keywords for internal search/sorting (e.g., trending, clearance)" />
                  </FormLabel>
                  <FormControl>
                    <MultiInput
                      onChange={field.onChange}
                      placeholder="Add tags..."
                      storageKey="collection-tags"
                      value={field.value}
                    />
                  </FormControl>
                  <FormDescription>
                    Add keywords for internal search/sorting (e.g., trending, clearance)
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
                  <FormLabel htmlFor={field.name}>
                    Internal notes{" "}
                    <InfoTooltip info="Private notes for admins only (e.g., batch info, supplier notes)" />
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      id={field.name}
                      placeholder="e.g., Imported on June batch, supplier: TechSource Ltd."
                    />
                  </FormControl>
                  <FormDescription>Private notes for admins only (e.g., batch info, supplier notes)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        {isEditMode && (
          <Card className="h-fit break-inside-avoid">
            <CardHeader>
              <CardTitle>Archive Collection</CardTitle>
              <CardDescription>
                This action will move the collection to the archive, removing it from public view. This action is
                reversible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button type="button" variant="outline">
                Move to Archive
              </Button>
            </CardContent>
          </Card>
        )}
        {isEditMode && (
          <Card className="h-fit break-inside-avoid border-destructive pb-0">
            <CardHeader>
              <CardTitle>Delete Collection</CardTitle>
              <CardDescription>
                The project will be permanently deleted, including its deployments and domains. This action is
                irreversible and can not be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                {thumbnail && (
                  <div className="relative aspect-5/4 h-24 overflow-hidden rounded-sm">
                    <Image
                      alt={thumbnail.alt ?? ""}
                      blurDataURL={thumbnail.metadata?.blurData ?? undefined}
                      className="object-cover"
                      fill
                      placeholder={thumbnail.metadata?.blurData ? "blur" : "empty"}
                      src={thumbnail?.file?.url ?? ""}
                    />
                  </div>
                )}
                <div>
                  <p>{form.getValues("title")}</p>
                  {updatedAt && (
                    <p className="text-xs">
                      Last Updated{" "}
                      {formatDate(updatedAt, {
                        includeTime: true,
                        relative: true,
                      })}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end border-destructive border-t bg-destructive/10 pb-3">
              <CardAction>
                <Button type="button" variant="destructive">
                  Delete
                </Button>
              </CardAction>
            </CardFooter>
          </Card>
        )}
      </div>
    </>
  );
});
