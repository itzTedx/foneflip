import Link from "next/link";
import { Dispatch, SetStateAction, memo, useCallback, useMemo } from "react";

import { CollectionMetadata } from "@/features/collections/types";
import { IconCaretUpDownFilled } from "@tabler/icons-react";
import { Button } from "@ziron/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@ziron/ui/command";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, useFormContext } from "@ziron/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@ziron/ui/popover";
import { cn } from "@ziron/utils";
import { ProductFormType } from "@ziron/validators";


interface CollectionSelectorProps {
  collections?: CollectionMetadata[];
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export const CollectionDropdown = memo(function CollectionDropdown({
  collections,
  open,
  setOpen,
}: CollectionSelectorProps) {
  const form = useFormContext<ProductFormType>();

  const collectionId = form.getValues("collectionId");

  // Memoize company lookup
  const selectedCollection = useMemo(() => {
    return collections?.find((cat) => cat.id === collectionId);
  }, [collections, collectionId]);

  // Memoize selection handler
  const handleSelect = useCallback(
    (categoryId?: string) => {
      if (categoryId) {
        form.setValue("collectionId", categoryId);
        setOpen(false);
      }
    },
    [form]
  );

  return (
    <FormField
      control={form.control}
      name="collectionId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Collection</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "border-input text-foreground w-full justify-between",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {selectedCollection ? (
                    <span className="inline-flex items-center gap-2.5">
                      <span>{selectedCollection.title}</span>
                    </span>
                  ) : (
                    "Select Collection"
                  )}
                  <IconCaretUpDownFilled className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent align="start" className="p-0 ">
              <Command>
                <CommandInput placeholder="Search Collection..." />
                <CommandEmpty>Collection not found</CommandEmpty>
                <CommandList className="max-h-[300px] overflow-auto">
                  <CommandGroup heading="Collection">
                    {collections?.map((cat) => (
                      <CommandItem
                        value={cat.title}
                        className="cursor-pointer gap-2.5 px-4 py-2.5 font-medium"
                        key={cat.id}
                        onSelect={() => handleSelect(cat.id?.toString())}
                      >
                        <span>{cat.title}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandGroup heading="New Collection?">
                    <CommandItem className="cursor-pointer px-4 py-2.5 font-medium">
                      <Link href="/collections/new" className="w-full">
                        Add new
                      </Link>
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
});
