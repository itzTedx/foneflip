"use client";

import { memo, useCallback, useState } from "react";

import { IconPlus, IconTrash } from "@tabler/icons-react";
import { ChevronsUpDown } from "lucide-react";

import { Button } from "@ziron/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ziron/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@ziron/ui/collapsible";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage, useFieldArray, useFormContext
} from "@ziron/ui/form";
import { Input } from "@ziron/ui/input";
import { MultiInput } from "@ziron/ui/multi-input";
import { cn } from "@ziron/utils";
import { ProductFormType } from "@ziron/validators";



// Attribute name to default suggestions mapping
const ATTRIBUTE_SUGGESTIONS: Record<string, string[]> = {
  color: ["Black", "White", "Blue", "Red", "Green", "Gold", "Silver", "Gray"],
  storage: ["32GB", "64GB", "128GB", "256GB", "512GB", "1TB", "2TB"],
  size: ["Small", "Medium", "Large", "XL", "XXL"],
  material: ["Plastic", "Metal", "Glass", "Ceramic", "Leather"],
  // Add more as needed
};

interface AttributeItemProps {
  index: number;
  onRemove: (index: number) => void;
  isEditMode: boolean;
  totalFields: number;
  hasVariant: boolean;
}

const AttributeItem = memo(function AttributeItem({
  index,
  onRemove,
  isEditMode,
  totalFields,
  hasVariant,
}: AttributeItemProps) {
  const { control, watch } = useFormContext<ProductFormType>();
  const name = watch( `attributes.${index}.name` );
  const options = watch( `attributes.${index}.options` );

  const [isOpen, setIsOpen] = useState(() =>
    isEditMode ? totalFields < 3 : true
  );

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      disabled={!hasVariant}
      className="rounded-md border"
    >
      <div className="flex items-center justify-between px-3 py-1">
        <CollapsibleTrigger disabled={!hasVariant}>
          <h2 className={cn("w-full cursor-pointer text-sm font-medium")}>
            {name || options?.length ? (
              <span>
                <span className="text-muted-foreground pr-1 font-light">
                  {index + 1 < 10 ? `0${index + 1}` : index + 1}
                </span>{" "}
                {name}
                {options.length > 0 && <>: {options.join(", ")}</>}
              </span>
            ) : (
              `Attribute ${index + 1 < 10 ? `0${index + 1}` : index + 1}`
            )}
          </h2>
        </CollapsibleTrigger>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            size="btn"
            variant="ghost"
            type="button"
            onClick={() => onRemove(index)}
            className={cn(
              totalFields > 1 ? "" : "hidden",
              "text-muted-foreground hover:text-destructive"
            )}
          >
            <IconTrash className="size-3" />
          </Button>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="btn"
              className="-mr-2 shrink-0 p-0"
              disabled={!hasVariant}
            >
              <ChevronsUpDown className="text-muted-foreground/80 h-4 w-4" />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>

      <CollapsibleContent className="grid gap-4 border-t data-[state=open]:p-3">
        <FormField
          control={control}
          name={`attributes.${index}.name`}
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Label</FormLabel>
              <FormControl>
                <Input
                  placeholder="Attribute Name (Color, Storage, etc.)"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`attributes.${index}.options`}
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Options</FormLabel>
              <FormControl>
                <MultiInput
                  placeholder="Attribute Options"
                  storageKey={
                    name
                      ? `attributes-${name.trim().toLowerCase()}-options`
                      : undefined
                  }
                  value={field.value}
                  onChange={field.onChange}
                  suggestions={
                    name && ATTRIBUTE_SUGGESTIONS[name.trim().toLowerCase()]
                      ? ATTRIBUTE_SUGGESTIONS[name.trim().toLowerCase()]
                      : []
                  }
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
      </CollapsibleContent>
    </Collapsible>
  );
});

interface Props {
  isEditMode: boolean;
}

export const ProductAttributes = memo(function ProductAttributes({
  isEditMode,
}: Props) {
  const form = useFormContext<ProductFormType>();
  const hasVariant = form.watch("hasVariant");
  const {
    fields: attrFields,
    append: appendAttr,
    remove: removeAttr,
  } = useFieldArray({
    name: "attributes",
    control: form.control,
  });

  const handleAttrAppend = useCallback(() => {
    appendAttr({ name: "", options: [] });
  }, [appendAttr]);

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Attributes</CardTitle>
        <CardDescription>
          Define which options (e.g., Color, Storage) your product supports
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {attrFields?.map((field, index) => (
          <AttributeItem
            key={field.id}
            index={index}
            onRemove={removeAttr}
            isEditMode={isEditMode}
            totalFields={attrFields.length}
            hasVariant={hasVariant ?? false}
          />
        ))}

        <Button
          variant="outline"
          type="button"
          onClick={handleAttrAppend}
          disabled={!hasVariant}
        >
          <IconPlus className="size-4" />
          <span className="block">Add New Attribute</span>
        </Button>
      </CardContent>
    </Card>
  );
});
