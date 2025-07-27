import { memo } from "react";

import { CollectionMetadata } from "@/features/collections/types";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, useFormContext } from "@ziron/ui/form";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@ziron/ui/select";
import { ProductFormType } from "@ziron/validators";

interface CollectionSelectorProps {
  collections?: CollectionMetadata[];

}

export const CollectionDropdown = memo(function CollectionDropdown({
  collections,
}: CollectionSelectorProps) {
  const form = useFormContext<ProductFormType>();

  return (
    <FormField
      control={form.control}
      name="collectionId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Collection</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger className="ps-2 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_img]:shrink-0 w-full">
                <SelectValue placeholder="Choose Collection" />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2">
              <SelectGroup>
                <SelectLabel className="ps-2">Collections</SelectLabel>
                  {collections?.map((cat) => (
                    <SelectItem value={cat.id} key={cat.id}>
                      <span className="truncate">{cat.title}</span>
                    </SelectItem>
                  ))}
                </SelectGroup>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
});

// export const CollectionDropdownBackup = memo(function CollectionDropdown({
//   collections,
//   open,
//   setOpen,
// }: CollectionSelectorProps) {
//   const form = useFormContext<ProductFormType>();

//   const collectionId = form.getValues("collectionId");

//   // Memoize company lookup
//   const selectedCollection = useMemo(() => {
//     return collections?.find((cat) => cat.id === collectionId);
//   }, [collections, collectionId]);

//   // Memoize selection handler
//   const handleSelect = useCallback(
//     (categoryId?: string) => {
//       if (categoryId) {
//         form.setValue("collectionId", categoryId);
//         setOpen(false);
//       }
//     },
//     [form]
//   );

//   return (
//     <FormField
//       control={form.control}
//       name="collectionId"
//       render={({ field }) => (
//         <FormItem>
//           <FormLabel>Collection</FormLabel>
//           <Popover open={open} onOpenChange={setOpen}>
//             <PopoverTrigger asChild>
//               <FormControl>
//                 <Button
//                   variant="outline"
//                   role="combobox"
//                   className={cn(
//                     "border-input text-foreground w-full justify-between",
//                     !field.value && "text-muted-foreground"
//                   )}
//                 >
//                   {selectedCollection ? (
//                     <span className="inline-flex items-center gap-2.5">
//                       <span>{selectedCollection.title}</span>
//                     </span>
//                   ) : (
//                     "Select Collection"
//                   )}
//                   <IconCaretUpDownFilled className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                 </Button>
//               </FormControl>
//             </PopoverTrigger>
//             <PopoverContent align="start" className="p-0 ">
//               <Command>
//                 <CommandInput placeholder="Search Collection..." />
//                 <CommandEmpty>Collection not found</CommandEmpty>
//                 <CommandList className="max-h-[300px] overflow-auto">
//                   <CommandGroup heading="Collection">
//                     {collections?.map((cat) => (
//                       <CommandItem
//                         value={cat.title}
//                         className="cursor-pointer gap-2.5 px-4 py-2.5 font-medium"
//                         key={cat.id}
//                         onSelect={() => handleSelect(cat.id?.toString())}
//                       >
//                         <span>{cat.title}</span>
//                       </CommandItem>
//                     ))}
//                   </CommandGroup>
//                   <CommandGroup heading="New Collection?">
//                     <CommandItem className="cursor-pointer px-4 py-2.5 font-medium">
//                       <Link href="/collections/new" className="w-full">
//                         Add new
//                       </Link>
//                     </CommandItem>
//                   </CommandGroup>
//                 </CommandList>
//               </Command>
//             </PopoverContent>
//           </Popover>
//           <FormMessage />
//         </FormItem>
//       )}
//     />
//   );
// });
