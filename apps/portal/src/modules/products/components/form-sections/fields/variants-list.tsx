"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { IconPlus, IconSparkles, IconTrash } from "@tabler/icons-react";
import { AlertCircleIcon, ChevronsUpDown } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@ziron/ui/alert";
import { IconAed } from "@ziron/ui/assets/currency";
import { Button } from "@ziron/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ziron/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@ziron/ui/collapsible";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFieldArray,
  useFormContext,
} from "@ziron/ui/form";
import { Input, NumberInput } from "@ziron/ui/input";
import { cn } from "@ziron/utils";
import { ProductFormType } from "@ziron/validators";

import RadioGroupSelector from "@/components/ui/radio-group";
import { generateSKU } from "@/lib/functions/generate-sku";
import { ATTRIBUTE_TYPES } from "@/modules/products/data/constants";

type Variant = NonNullable<ProductFormType["variants"]>[number];

/**
 * Type guard that checks whether a variant is not null or undefined.
 *
 * @returns `true` if the variant is defined; otherwise, `false`.
 */
function isValidVariant(variant: Variant): variant is NonNullable<Variant> {
  return variant != null;
}

interface Props {
  isEditMode: boolean;
}

/**
 * Renders a numeric input field for entering the selling or original price of a product variant.
 *
 * Displays a currency icon and supports validation messages. The input is bound to the form field for the specified variant and price type.
 *
 * @param variantIndex - Index of the variant in the variants array
 * @param priceType - Type of price to edit ("selling" or "original")
 * @param label - Label for the input field
 * @param placeholder - Placeholder text for the input field (defaults to "0.00")
 */
function PriceInput({
  variantIndex,
  priceType,
  label,
  placeholder = "0.00",
}: {
  variantIndex: number;
  priceType: "selling" | "original";
  label: string;
  placeholder?: string;
}) {
  const form = useFormContext<ProductFormType>();
  return (
    <FormField
      control={form.control}
      name={`variants.${variantIndex}.price.${priceType}`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                {...field}
                className="peer ps-6"
                id={field.name}
                min="0"
                placeholder={placeholder}
                step="0.01"
                type="number"
              />
              <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 text-muted-foreground text-sm peer-disabled:opacity-50">
                <IconAed className="size-3 fill-muted-foreground" />
              </span>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// VariantAttribute (already not memoized)
const VariantAttribute = ({
  fieldId,
  attrId,
  attrIndex,
  variantIndex,
}: {
  fieldId: string;
  attrId: string;
  attrIndex: number;
  variantIndex: number;
}) => {
  const form = useFormContext<ProductFormType>();

  const attributeName = form.watch(`attributes.${attrIndex}.name`);
  const attributeOptions = form.watch(`attributes.${attrIndex}.options`);

  // Early return if attribute data is not available
  if (!attributeName || !attributeOptions || attributeOptions.length === 0) {
    return null;
  }

  return (
    <FormField
      control={form.control}
      key={`${fieldId}-${attrId}`}
      name={`variants.${variantIndex}.attributes.${attrIndex}.value`}
      render={({ field }) => (
        <FormItem className="flex flex-col items-start p-2 md:flex-row">
          <FormLabel className="py-2">{attributeName}: </FormLabel>
          <FormControl>
            <RadioGroupSelector
              items={attributeOptions.map((attr) => ({
                label: attr,
                value: attr,
              }))}
              onValueChange={(value) => {
                field.onChange(value);
                form.setValue(`variants.${variantIndex}.attributes.${attrIndex}.name`, attributeName);
              }}
              value={field.value}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

/**
 * Renders an input field for a variant's SKU with a button to trigger SKU generation.
 *
 * @param variantIndex - The index of the variant in the variants array
 * @param onGenerateSku - Callback invoked when the generate SKU button is clicked, receiving the variant index
 */
function SkuInput({ variantIndex, onGenerateSku }: { variantIndex: number; onGenerateSku: (index: number) => void }) {
  const form = useFormContext<ProductFormType>();
  return (
    <FormField
      control={form.control}
      name={`variants.${variantIndex}.sku`}
      render={({ field }) => (
        <FormItem className="col-span-2">
          <FormLabel>SKU</FormLabel>
          <FormControl>
            <div className="flex rounded-md shadow-xs">
              <Input
                {...field}
                className="-me-px flex-1 rounded-e-none shadow-none focus-visible:z-10"
                id={field.name}
                placeholder="APP-16-PM-BL"
              />
              <Button
                className="-ms-px rounded-s-none border-l-0"
                onClick={() => onGenerateSku(variantIndex)}
                type="button"
                variant="outline"
              >
                <IconSparkles className="h-4 w-4" />
              </Button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/**
 * Renders a numeric input field for the stock quantity of a specific product variant within the form.
 *
 * @param variantIndex - The index of the variant in the variants array
 */
function StockInput({ variantIndex }: { variantIndex: number }) {
  const form = useFormContext<ProductFormType>();
  return (
    <FormField
      control={form.control}
      name={`variants.${variantIndex}.stock`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Stock</FormLabel>
          <FormControl>
            <NumberInput {...field} defaultValue={field.value} minValue={0} onChange={field.onChange} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function VariantHeader({
  index,
  variantLabel,
  hasVariant,
  canRemove,
  onRemove,
}: {
  index: number;
  variantLabel: string;
  hasVariant: boolean;
  canRemove: boolean;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-1">
      <CollapsibleTrigger disabled={!hasVariant}>
        <h2 className={cn("flex w-full cursor-pointer items-center gap-2 font-medium text-sm")}>
          <span className="font-light text-muted-foreground">{index + 1 < 10 ? `0${index + 1}` : index + 1}</span>
          {variantLabel}
        </h2>
      </CollapsibleTrigger>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          className={cn(canRemove ? "" : "hidden", "text-muted-foreground hover:text-destructive")}
          onClick={onRemove}
          size="btn"
          type="button"
          variant="ghost"
        >
          <IconTrash className="size-3" />
        </Button>
        <CollapsibleTrigger asChild>
          <Button className="-mr-2 shrink-0 p-0" disabled={!hasVariant} size="btn" variant="ghost">
            <ChevronsUpDown className="h-4 w-4 text-muted-foreground/80" />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
    </div>
  );
}

function VariantContent({
  variantIndex,
  attrFields,
}: {
  variantIndex: number;
  attrFields: Array<{ id: string; name?: string; options?: string[] }>;
}) {
  const form = useFormContext<ProductFormType>();
  const attributes = form.watch("attributes");
  const handleGenerateSku = useCallback(
    (index: number) => {
      const sku = `variants.${index}.sku` as const;
      form.clearErrors(sku);
      const title = form.getValues("title");
      const brand = form.getValues("brand");
      const condition = form.getValues("condition");
      const variants = (form.getValues("variants") ?? []).filter(isValidVariant);
      const currentSku = form.getValues(sku);
      const variantAttributes = form.getValues(`variants.${index}.attributes`);

      function findAttributeByType(
        attributes: Array<{ name?: string; value?: string }>,
        type: readonly string[]
      ): string {
        const attr = attributes.find((attr) => type.some((keyword) => attr.name?.toLowerCase().includes(keyword)));
        return attr?.value ?? "";
      }

      const color = findAttributeByType(variantAttributes, ATTRIBUTE_TYPES.COLOR);
      const storage = findAttributeByType(variantAttributes, ATTRIBUTE_TYPES.STORAGE);

      if (!title?.trim()) {
        form.setError(sku, {
          message: "Please enter a title first to generate",
        });
        return;
      }
      if (!brand?.trim()) {
        form.setError(sku, {
          message: "Please enter a brand first to generate",
        });
        return;
      }
      if (!condition?.trim()) {
        form.setError(sku, {
          message: "Please select a condition first to generate",
        });
        return;
      }
      try {
        const generatedSku = generateSKU(brand, title, condition, storage, color, variants, currentSku);
        form.setValue(sku, generatedSku, {
          shouldValidate: true,
          shouldDirty: true,
        });
      } catch (error) {
        form.setError(sku, {
          message: error instanceof Error ? error.message : "Failed to generate SKU. Please try again.",
        });
        console.error("SKU generation error:", error);
      }
    },
    [form]
  );
  return (
    <CollapsibleContent className="!pt-0 grid gap-3 border-t p-3">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="mb-1 font-medium text-muted-foreground text-xs leading-none">Variant Options</h3>
          <Button size="sm" type="button" variant="link">
            Mark as Default
          </Button>
        </div>
        <div className="grid divide-y rounded-md border md:grid-cols-2 md:gap-3 md:divide-x">
          {attributes?.map((attr: { name?: string; options?: string[] }, attrIndex: number) => (
            <VariantAttribute
              attrId={`attr-${attrIndex}`}
              attrIndex={attrIndex}
              fieldId={`attr-${attrIndex}`}
              key={`attr-${attrIndex}-${variantIndex}`}
              variantIndex={variantIndex}
            />
          ))}
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-md border p-2">
          <h3 className="mb-2 font-medium text-muted-foreground text-xs">Pricing</h3>
          <div className="grid grid-cols-2 gap-3">
            <PriceInput label="Selling Price" priceType="selling" variantIndex={variantIndex} />
            <PriceInput label="Original Price" priceType="original" variantIndex={variantIndex} />
          </div>
        </div>
        <div className="rounded-md border p-2">
          <h3 className="mb-2 font-medium text-muted-foreground text-xs">Inventory</h3>
          <div className="grid grid-cols-3 gap-3">
            <StockInput variantIndex={variantIndex} />
            <SkuInput onGenerateSku={handleGenerateSku} variantIndex={variantIndex} />
          </div>
        </div>
      </div>
    </CollapsibleContent>
  );
}

export function ProductVariantsList({ isEditMode }: Props) {
  const form = useFormContext<ProductFormType>();
  const hasVariant = form.watch("hasVariant");

  const { fields: attrFields } = useFieldArray({
    name: "attributes",
    control: form.control,
  });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    name: "variants",
    control: form.control,
  });

  // Check if there are valid attributes (with name and options)
  const attributes = form.watch("attributes");

  const hasValidAttributes = useMemo(() => {
    // Try both approaches to ensure we catch all updates
    const fromWatch =
      attributes?.some((attr) => {
        return attr?.name && attr?.options && attr.options.length > 0;
      }) ?? false;

    const fromFields = attrFields.some((_field, index) => {
      const attr = form.getValues(`attributes.${index}`);
      return attr?.name && attr?.options && attr.options.length > 0;
    });

    return fromWatch || fromFields;
  }, [attributes, attrFields, form]);

  // Controlled open state for each Collapsible
  const [openStates, setOpenStates] = useState<boolean[]>(() =>
    variantFields.map(() => (isEditMode ? variantFields.length < 3 : true))
  );

  const handleVariantAppend = useCallback(() => {
    const attributes = form.watch("attributes");
    const defaultVariantTemplate = {
      attributes: (attributes ?? [])
        .filter(
          (
            attr
          ): attr is {
            name: string;
            options: string[];
          } => !!attr
        )
        .map((attr) => ({ name: attr.name, value: "" })),
      price: {
        selling: "",
        original: "",
      },
      isDefault: false,
      sku: "",
      stock: 0,
    };
    appendVariant(defaultVariantTemplate);
    setOpenStates((prev) => [...prev, true]);
  }, [appendVariant, form]);

  const handleVariantRemove = useCallback(
    (index: number) => () => {
      removeVariant(index);
      setOpenStates((prev) => prev.filter((__, idx) => idx !== index));
    },
    [removeVariant]
  );

  const handleOpenChange = useCallback(
    (index: number) => (open: boolean) => {
      setOpenStates((prev) => prev.map((v, idx) => (idx === index ? open : v)));
    },
    []
  );

  // Memoize variant labels to avoid recalculating on every render
  const variantLabels = useMemo(() => {
    return variantFields.map((field, index) => {
      const variantAttributes = form.watch(`variants.${index}.attributes`);
      return (
        variantAttributes
          ?.map((attr) => attr.value)
          .filter(Boolean)
          .join(" / ") || `Variant ${index + 1}`
      );
    });
  }, [variantFields, form]);

  // Sync variants' attributes with attributes array
  useEffect(() => {
    if (!hasVariant) return;
    const attributes = form.watch("attributes") ?? [];

    variantFields.forEach((_, variantIndex) => {
      const variantAttributes = form.getValues(`variants.${variantIndex}.attributes`) ?? [];
      // If the number of attributes has changed, update the variant's attributes
      if (variantAttributes.length !== attributes.length) {
        const newAttributes = attributes.map((attr, attrIndex) => ({
          name: attr?.name || "",
          value: variantAttributes[attrIndex]?.value || "",
        }));
        form.setValue(`variants.${variantIndex}.attributes`, newAttributes, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    });
  }, [hasVariant, form, variantFields.length, attributes]);

  return (
    <Card className="h-fit md:col-span-2">
      <CardHeader>
        <CardTitle>Variants</CardTitle>
        <CardDescription>Configure each combination with its own details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasValidAttributes && hasVariant && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>No attributes defined.</AlertTitle>
            <AlertDescription>
              <p>Please add at least one attribute with options before creating variants.</p>
            </AlertDescription>
          </Alert>
        )}
        {variantFields?.map((field, index) => (
          <Collapsible
            className="rounded-md border"
            disabled={!hasVariant}
            key={field.id}
            onOpenChange={handleOpenChange(index)}
            open={openStates[index]}
          >
            <VariantHeader
              canRemove={variantFields.length > 1}
              hasVariant={Boolean(hasVariant)}
              index={index}
              onRemove={handleVariantRemove(index)}
              variantLabel={variantLabels[index] ?? ""}
            />
            <VariantContent attrFields={attrFields} variantIndex={index} />
          </Collapsible>
        ))}

        <Button
          disabled={!hasVariant || !hasValidAttributes}
          onClick={handleVariantAppend}
          type="button"
          variant="outline"
        >
          <IconPlus className="size-4" />
          <span className="block">Add New Variant</span>
        </Button>
      </CardContent>
    </Card>
  );
}
