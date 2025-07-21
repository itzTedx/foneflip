"use client";

import { memo } from "react";
import Image from "next/image";
import { TabNavigation } from "@/components/layout/tab-navigation";
import { InfoTooltip } from "@/components/ui/tooltip";
import { IconSpeakerphone } from "@tabler/icons-react";
import { CheckIcon, MinusIcon } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { IconDot } from "@ziron/ui/assets/icons";
import { Button } from "@ziron/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@ziron/ui/components/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@ziron/ui/components/form";
import { Input } from "@ziron/ui/components/input";
import { MultiInput } from "@ziron/ui/components/multi-input";
import { RadioGroup, RadioGroupItem } from "@ziron/ui/components/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ziron/ui/components/select";
import { Switch } from "@ziron/ui/components/switch";
import { Textarea } from "@ziron/ui/components/textarea";
import { cn, formatDate } from "@ziron/utils";
import { CollectionFormType, collectionStatusEnum } from "@ziron/validators";

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

export const CollectionSettings = memo(function CollectionSettings({
  isEditMode,
  updatedAt,
}: Props) {
  const form = useFormContext<CollectionFormType>();

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="px-2 text-lg font-medium">Collection Settings</h2>
        <TabNavigation currentTab="seo" type="collections" />
      </div>
      <div className="gap-3 space-y-3 md:columns-2">
        <Card className="h-fit break-inside-avoid">
          <CardHeader>
            <CardTitle>Visibility & status</CardTitle>
            <CardDescription>
              Manage whether the collection is publicly visible, in draft, or
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
                    <InfoTooltip info="Determines the collection's visibility status. New collections default to 'active', while saving as a draft sets the status to 'draft'." />
                  </FormLabel>
                  <FormControl>
                    <Select
                      defaultValue={collectionStatusEnum.enum.draft}
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled
                    >
                      <SelectTrigger
                        id={field.name}
                        className="min-w-32 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0"
                      >
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent
                        position="item-aligned"
                        className="[&_*[role=option]>span>svg]:text-muted-foreground/80 [&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]>span>svg]:shrink-0"
                      >
                        {collectionStatusEnum.options.map((status) => (
                          <SelectItem value={status} key={status}>
                            <span className="flex items-center gap-2">
                              <IconDot
                                className={cn(
                                  "size-2",
                                  status === "active" && "text-emerald-600",
                                  status === "draft" && "text-muted-foreground",
                                  status === "archived" && "text-destructive",
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
              name="settings.showInNav"
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
                          Show in navbar
                        </FormLabel>
                        <FormDescription className="text-muted-foreground text-xs">
                          Show or hide this collection from the storefront
                          navbar.
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
              Manage whether the collection is publicly visible, in draft, or
              archived.
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
                    <InfoTooltip info="Control whether the collection is live, in draft, or archived." />
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      className="flex gap-3"
                      defaultValue={field.value}
                    >
                      {layouts.map((item, id) => (
                        <label key={`${id}-${item.value}`}>
                          <RadioGroupItem
                            id={`${id}-${item.value}`}
                            value={item.value}
                            onClick={() => field.onChange(item.value)}
                            className="peer sr-only after:absolute after:inset-0"
                          />
                          <Image
                            src={item.image}
                            alt={item.layout}
                            width={180}
                            height={120}
                            className="border-input peer-focus-visible:ring-ring/50 peer-data-[state=checked]:border-ring peer-data-[state=checked]:bg-accent relative cursor-pointer overflow-hidden rounded-md border shadow-xs transition-[color,box-shadow] outline-none peer-focus-visible:ring-[3px] peer-data-disabled:cursor-not-allowed peer-data-disabled:opacity-50"
                          />
                          <span className="group peer-data-[state=unchecked]:text-muted-foreground/70 mt-2 flex items-center gap-1">
                            <CheckIcon
                              size={16}
                              className="group-peer-data-[state=unchecked]:hidden"
                              aria-hidden="true"
                            />
                            <MinusIcon
                              size={16}
                              className="group-peer-data-[state=checked]:hidden"
                              aria-hidden="true"
                            />
                            <span className="text-xs font-medium">
                              {item.layout}
                            </span>
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
                    <div className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        onBlur={field.onBlur}
                        disabled={field.disabled}
                        className="order-1 h-4 w-6 after:absolute after:inset-0 [&_span]:size-3 data-[state=checked]:[&_span]:translate-x-2 data-[state=checked]:[&_span]:rtl:-translate-x-2"
                      />
                      <div className="grid grow gap-2">
                        <FormLabel htmlFor={field.name}>Show banner</FormLabel>
                        <FormDescription className="text-muted-foreground text-xs">
                          Show or hide banner for this collection in storefront
                          homepage.
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
              name="settings.showLabel"
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
                        <FormLabel htmlFor={field.name}>Show label</FormLabel>
                        <FormDescription className="text-muted-foreground text-xs">
                          Show or hide this collection label from the storefront
                          collection tile.
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
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <MultiInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Add tags..."
                      storageKey="collection-tags"
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
                    <Textarea
                      {...field}
                      id={field.name}
                      placeholder="e.g., Imported on June batch, supplier: TechSource Ltd."
                    />
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
        {isEditMode && (
          <Card className="h-fit break-inside-avoid">
            <CardHeader className="flex items-center justify-center">
              <div className="space-y-1.5">
                <CardTitle>Archive Collection</CardTitle>
                <CardDescription>
                  This action will move the collection to the archive, removing
                  it from public view. This action is reversible.
                </CardDescription>
              </div>
              <CardAction>
                <Button variant="outline" type="button">
                  Move to Archive
                </Button>
              </CardAction>
            </CardHeader>
          </Card>
        )}
        {isEditMode && (
          <Card className="border-destructive h-fit break-inside-avoid pb-0">
            <CardHeader>
              <CardTitle>Delete Collection</CardTitle>
              <CardDescription>
                The project will be permanently deleted, including its
                deployments and domains. This action is irreversible and can not
                be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="aspect-5/3 h-16 rounded-sm bg-red-400"></div>
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
            <CardFooter className="border-destructive bg-destructive/10 justify-end border-t pb-3">
              <CardAction>
                <Button variant="destructive" type="button">
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
