"use client";

import { IconSparkles } from "@tabler/icons-react";

import { Button } from "@ziron/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ziron/ui/card";
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
import { Switch } from "@ziron/ui/switch";
import { Textarea } from "@ziron/ui/textarea";
import { slugify } from "@ziron/utils";
import type { CollectionFormType } from "@ziron/validators";

import { TabNavigation } from "@/components/ui/tab-navigation";
import { InfoTooltip } from "@/components/ui/tooltip";

export function CollectionDetails() {
  const form = useFormContext<CollectionFormType>();

  const handleGenerateSlug = () => {
    form.clearErrors("slug");

    const title = form.getValues("title");

    if (!title) {
      form.setError("slug", {
        message: "Please enter a title first",
      });
      return;
    }

    try {
      const slug = slugify(title);
      form.setValue("slug", slug, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } catch (error) {
      form.setError("slug", {
        message: "Failed to generate slug. Please try again.",
      });
      console.log(error);
    }
  };

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="px-2 font-medium text-lg">General Info</h2>
        <TabNavigation currentTab="details" type="collections" />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Card className="h-fit md:col-span-2">
          <CardHeader>
            <CardTitle>Collection Details</CardTitle>
            <CardDescription>Basic info for identifying the collection.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Collection Title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Collection Description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Classification</CardTitle>
            <CardDescription>Organize the collection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Slug{" "}
                      <InfoTooltip
                        info={
                          <p>
                            Enter a unique, URL-friendly identifier for the Collection{" "}
                            <strong className="font-medium">(e.g. iphone).</strong> Used in the collection link.
                          </p>
                        }
                      />
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input placeholder="Slug" {...field} />
                        <Button onClick={handleGenerateSlug} type="button" variant="outline">
                          <IconSparkles className="h-4 w-4" />
                          Generate
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>Automatically Generate from Title of the collection</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Label{" "}
                    <InfoTooltip
                      info={
                        <p>A short tag (e.g., “New Arrivals”) shown on the storefront to highlight this collection.</p>
                      }
                    />
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="New Arrivals" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="settings.isFeatured"
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
                        <FormLabel htmlFor={field.name}>Featured Collection</FormLabel>
                        <FormDescription className="text-muted-foreground text-xs">
                          Used for homepage banners, promo spots
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
      </div>
    </>
  );
}
