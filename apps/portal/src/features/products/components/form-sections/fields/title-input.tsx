


import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    useFormContext,
} from "@ziron/ui/form";
import { Input } from "@ziron/ui/input";
import { ProductFormType } from "@ziron/validators";



export function ProductTitleInput() {
  const form = useFormContext<ProductFormType>();
  return (
    <FormField
      control={form.control}
      name="title"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Title</FormLabel>
          <FormControl>
            <Input placeholder="Product Title" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}