import { memo } from "react";
import Link from "next/link";

import { IconPlus } from "@tabler/icons-react";

import { Button } from "@ziron/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, useFormContext } from "@ziron/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@ziron/ui/select";
import { ProductFormType } from "@ziron/validators";

import { CollectionMetadata } from "@/modules/collections/types";

interface CollectionSelectorProps {
  collections?: CollectionMetadata[];
}

export const CollectionDropdown = memo(function CollectionDropdown({ collections }: CollectionSelectorProps) {
  const form = useFormContext<ProductFormType>();

  return (
    <FormField
      control={form.control}
      name="collectionId"
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel>Collection</FormLabel>
          <Select defaultValue={field.value} onValueChange={field.onChange}>
            <FormControl>
              <div className="flex items-center gap-2">
                <SelectTrigger className="w-full ps-2 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_img]:shrink-0">
                  <SelectValue placeholder="Choose Collection" />
                </SelectTrigger>

                <Button asChild size="icon" variant="outline">
                  <Link href="/collections/new" target="_blank">
                    <IconPlus />
                  </Link>
                </Button>
              </div>
            </FormControl>
            <SelectContent className="[&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8">
              <SelectGroup>
                <SelectLabel className="ps-2">Collections</SelectLabel>
                {collections?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <span className="truncate">{cat.title}</span>
                  </SelectItem>
                ))}
              </SelectGroup>
              {/* <SelectGroup>
                <SelectLabel className="ps-2">Couldn't found the collections?</SelectLabel>
                <SelectItem value="add-new">
                  <span className="truncate">Request for new Collection</span>
                </SelectItem>
              </SelectGroup> */}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
});
