import { memo } from "react";

import RadioGroupSelector from "@/components/ui/radio-group";
import {
    FormControl,
    FormField,
    FormItem,
    FormMessage,
    useFormContext
} from "@ziron/ui/form";
import { productConditionEnum, ProductFormType } from "@ziron/validators";



export const ConditionSelector = memo(function ConditionSelector() {
  const form = useFormContext<ProductFormType>();
  return (
    <FormField
      control={form.control}
      name="condition"
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <RadioGroupSelector
              items={productConditionEnum.options.map((o) => ({
                label: o,
                value: o,
              }))}
              title="Condition"
              onValueChange={field.onChange}
              value={field.value}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
});
