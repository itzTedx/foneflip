"use client";

import { memo } from "react";

import { useFormContext } from "react-hook-form";

import { SeoPreview } from "@/components/cells/seo-preview";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import MultiInput from "@/components/ui/multi-input";
import { Textarea } from "@/components/ui/textarea";
import { TabNavigation } from "@/features/products/components/tab-navigation";

import { CollectionFormType } from "../../collection-schema";

export const CollectionSEO = memo(function CollectionSEO() {
  const form = useFormContext<CollectionFormType>();

  const metadata = form.watch("meta");
  const slug = form.watch("slug");

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="px-2 text-lg font-medium">SEO & Meta tags</h2>
        <TabNavigation currentTab="seo" type="collections" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Card className="sticky top-[20vh] h-fit">
          <CardHeader>
            <CardTitle>Meta Tags</CardTitle>
            <CardDescription>
              Improve search visibility with meta title, description, and
              keywords
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="meta.title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Meta Title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="meta.description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Meta Description" {...field} />
                  </FormControl>
                  <FormDescription>
                    Recommended length: 150-160 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="meta.keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta keywords</FormLabel>
                  <FormControl>
                    <MultiInput
                      placeholder="Meta Keywords"
                      value={
                        field.value
                          ? field.value
                              .split(",")
                              .map((k: string) => k.trim())
                              .filter(Boolean)
                          : []
                      }
                      onChange={(tags) => field.onChange(tags.join(","))}
                    />
                  </FormControl>
                  <FormDescription>
                    Add relevant keywords separated by commas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        <SeoPreview metadata={metadata} slug={slug} />
      </div>
    </>
  );
});
