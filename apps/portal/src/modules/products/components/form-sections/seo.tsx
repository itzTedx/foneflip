"use client";

import { memo } from "react";

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
import { useCharacterCount } from "@ziron/ui/hooks/use-character";
import { Input } from "@ziron/ui/input";
import { MultiInput } from "@ziron/ui/multi-input";
import { Textarea } from "@ziron/ui/textarea";
import { cn } from "@ziron/utils";
import { ProductFormType } from "@ziron/validators";

import { SeoPreview } from "@/components/preview/seo";
import { TabNavigation } from "@/components/ui/tab-navigation";

export const ProductSeo = memo(function ProductSeo() {
  const form = useFormContext<ProductFormType>();

  const metadata = form.watch("meta");
  const slug = form.watch("slug");

  const titleHook = useCharacterCount({
    maxLength: 70,
    value: metadata?.title,
    onChange: (value) => form.setValue("meta.title", value),
  });

  const descriptionHook = useCharacterCount({
    maxLength: 160,
    value: metadata?.description,
    onChange: (value) => form.setValue("meta.description", value),
  });

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="px-2 font-medium text-lg">SEO & Meta tags</h2>
        <TabNavigation currentTab="seo" />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Card className="h-fit md:sticky md:top-[20vh]">
          <CardHeader>
            <CardTitle>Meta Tags</CardTitle>
            <CardDescription>Improve search visibility with meta title, description, and keywords</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="meta.title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="justify-between">
                    Meta Title{" "}
                    <div className="mt-1 flex justify-between text-sm">
                      <span className={titleHook.isMaxLengthExceeded ? "text-destructive" : "text-muted-foreground"}>
                        {titleHook.characterCount}
                      </span>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <div>
                      <Input
                        name={field.name}
                        onBlur={field.onBlur}
                        onChange={titleHook.handleChange}
                        placeholder="Meta Title"
                        value={field.value}
                      />
                    </div>
                  </FormControl>
                  <FormDescription className="flex items-center justify-between">
                    Recommended length: 60-70 characters
                    {titleHook.statusMessage && (
                      <span
                        className={cn(
                          "tabular-nums",
                          titleHook.isMaxLengthExceeded ? "text-destructive" : "text-yellow-500"
                        )}
                      >
                        {titleHook.statusMessage}
                      </span>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="meta.description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="justify-between">
                    Meta Description{" "}
                    <div className="mt-1 flex justify-between text-sm">
                      <span
                        className={descriptionHook.isMaxLengthExceeded ? "text-destructive" : "text-muted-foreground"}
                      >
                        {descriptionHook.characterCount}
                      </span>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Textarea className="min-h-[8ch]" placeholder="Meta Description" {...field} />
                  </FormControl>
                  <FormDescription className="flex items-center justify-between">
                    Recommended length: 150-160 characters{" "}
                    {descriptionHook.statusMessage && (
                      <span
                        className={cn(
                          "tabular-nums",
                          descriptionHook.isMaxLengthExceeded ? "text-destructive" : "text-yellow-500"
                        )}
                      >
                        {descriptionHook.statusMessage}
                      </span>
                    )}
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
                      onChange={(tags) => field.onChange(tags.join(","))}
                      placeholder="Meta Keywords"
                      storageKey="keywords"
                      suggestions={["Apple", "Iphone", "Pro Max", "ultra"]}
                      value={
                        field.value
                          ?.split(",")
                          .map((k: string) => k.trim())
                          .filter(Boolean) ?? []
                      }
                    />
                  </FormControl>
                  <FormDescription>Add relevant keywords separated by commas</FormDescription>
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
