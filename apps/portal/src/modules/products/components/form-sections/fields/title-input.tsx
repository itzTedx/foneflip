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

/**
 * Renders a form input field for entering the product title within a product form.
 *
 * Integrates with the form context to manage state and validation for the "title" field.
 */
export function ProductTitleInput() {
  const form = useFormContext<ProductFormType>();
  return (
    <FormField
      control={form.control}
      name="title"
      render={({ field }) => (
        <FormItem>
          <FormLabel required>Title</FormLabel>
          <FormControl>
            <Input placeholder="Product Title" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
