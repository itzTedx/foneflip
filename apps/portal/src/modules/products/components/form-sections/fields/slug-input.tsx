import { memo } from "react";

import { IconSparkles } from "@tabler/icons-react";

import { Button } from "@ziron/ui/button";
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
import { slugify } from "@ziron/utils";
import { ProductFormType } from "@ziron/validators";

import { InfoTooltip } from "@/components/ui/tooltip";

export const SlugInput = memo(function SlugInput() {
  const form = useFormContext<ProductFormType>();

  const handleGenerateSlug = () => {
    form.clearErrors("slug");

    const title = form.getValues("title");

    if (!title?.trim()) {
      form.setError("slug", {
        message: "Please enter a title first",
      });
      return;
    }

    const slug = slugify(title);
    form.setValue("slug", slug, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
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
                  Enter a unique, URL-friendly identifier for the product{" "}
                  <strong className="font-medium">(e.g. iphone-16-pro-max).</strong> Used in the product page link.
                </p>
              }
            />
          </FormLabel>
          <FormControl>
            <div className="flex rounded-md shadow-xs">
              <Input
                className="-me-px flex-1 rounded-e-none shadow-none focus-visible:z-10"
                placeholder="Slug"
                {...field}
              />
              <Button className="rounded-s-none" onClick={handleGenerateSlug} type="button" variant="outline">
                <IconSparkles className="h-4 w-4" />
                Generate
              </Button>
            </div>
          </FormControl>
          <FormDescription>Automatically Generate from Title of the Product</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
});
