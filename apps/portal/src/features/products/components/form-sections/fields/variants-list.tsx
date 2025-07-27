"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { IconPlus, IconSparkles, IconTrash } from "@tabler/icons-react";
import { AlertCircleIcon, ChevronsUpDown } from "lucide-react";


import { Alert, AlertDescription, AlertTitle } from "@ziron/ui/alert";
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

import RadioGroupSelector from "@/components/ui/radio-group";
import { generateSKU } from "@/lib/functions/generate-sku";
import { IconAed } from "@ziron/ui/assets/currency";
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
import { Switch } from "@ziron/ui/switch";
import { cn } from "@ziron/utils";
import { ProductFormType } from "@ziron/validators";



type Variant = NonNullable<ProductFormType["variants"]>[number];

function isValidVariant(variant: Variant): variant is NonNullable<Variant> {
  return variant != null;
}

interface Props {
  isEditMode: boolean;
}

// PriceInput component
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
                id={field.name}
                type="number"
                step="0.01"
                min="0"
                className="peer ps-6"
                placeholder={placeholder}
              />
              <span className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 text-sm peer-disabled:opacity-50">
                <IconAed className="fill-muted-foreground size-3" />
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

  return (
    <FormField
      key={`${fieldId}-${attrId}`}
      control={form.control}
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
                form.setValue(
                  `variants.${variantIndex}.attributes.${attrIndex}.name`,
                  attributeName
                );
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

// SkuInput component
function SkuInput({
  variantIndex,
  onGenerateSku,
}: {
  variantIndex: number;
  onGenerateSku: (index: number) => void;
}) {
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
                id={field.name}
                className="-me-px flex-1 rounded-e-none shadow-none focus-visible:z-10"
                placeholder="APP-16-PM-BL"
              />
               <Button
                variant="outline"
                type="button"
                className="rounded-s-none -ms-px border-l-0"
                onClick={() => onGenerateSku(variantIndex)}
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

// StockInput component
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
            <NumberInput
              {...field}
              defaultValue={field.value}
              onChange={field.onChange}
              minValue={0}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// DefaultVariantSwitch component
function DefaultVariantSwitch({ variantIndex }: { variantIndex: number }) {
  const form = useFormContext<ProductFormType>();
  return (
    <FormField
      control={form.control}
      name={`variants.${variantIndex}.isDefault`}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <div className="border-input has-data-[state=checked]:border-primary/50 relative flex w-fit items-start gap-4 rounded-md border p-3 shadow-xs outline-none">
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                id={field.name}
                disabled={field.disabled}
                className="order-1 h-4 w-6 after:absolute after:inset-0 [&_span]:size-3 data-[state=checked]:[&_span]:translate-x-2 data-[state=checked]:[&_span]:rtl:-translate-x-2"
                aria-describedby={`has-variant-description`}
              />
              <div className="grow">
                <FormLabel>Use image for this variant</FormLabel>
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// VariantHeader component
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
        <h2
          className={cn(
            "flex w-full cursor-pointer items-center gap-2 text-sm font-medium"
          )}
        >
          <span className="text-muted-foreground font-light">
            {index + 1 < 10 ? `0${index + 1}` : index + 1}
          </span>
          {variantLabel}
        </h2>
      </CollapsibleTrigger>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          size="btn"
          variant="ghost"
          type="button"
          onClick={onRemove}
          className={cn(
            canRemove ? "" : "hidden",
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
  );
}

// VariantContent component
function VariantContent({
  variantIndex,
  attrFields,
}: {
  variantIndex: number;
  attrFields: Array<{ id: string; name?: string; options?: string[] }>;
}) {
  const form = useFormContext<ProductFormType>();
  const handleGenerateSku = useCallback(
    (index: number) => {
      const sku = `variants.${index}.sku` as const;
      form.clearErrors(sku);
      const title = form.getValues("title");
      const brand = form.getValues("brand");
      const condition = form.getValues("condition");
      const variants = (form.getValues("variants") ?? []).filter(
        isValidVariant
      );
      const currentSku = form.getValues(sku);
      const variantAttributes = form.getValues(`variants.${index}.attributes`);
      const color =
      variantAttributes.find((attr) => attr.name?.toLowerCase().includes("color") || attr.name?.toLowerCase().includes("colour"))
          ?.value ?? "";
      const storage =
       variantAttributes.find((attr) => attr.name?.toLowerCase().includes("storage") || attr.name?.toLowerCase().includes("capacity"))
          ?.value ?? "";
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
        const generatedSku = generateSKU(
          brand,
          title,
          condition,
          storage,
          color,
          variants,
          currentSku
        );
        form.setValue(sku, generatedSku, {
          shouldValidate: true,
          shouldDirty: true,
        });
      } catch (error) {
        form.setError(sku, {
          message: "Failed to generate sku. Please try again.",
        });
        console.log(error);
      }
    },
    [form]
  );
  return (
    <CollapsibleContent className="grid gap-3 border-t p-3 !pt-0">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-muted-foreground mb-1 text-xs leading-none font-medium">
            Variant Options
          </h3>
          <Button size="sm" variant="link" type="button">
            Mark as Default
          </Button>
        </div>
        <div className="grid divide-y rounded-md border md:grid-cols-2 md:gap-3 md:divide-x">
          {attrFields.map((attr, attrIndex) => (
            <VariantAttribute
              key={`${attr.id}-${variantIndex}`}
              fieldId={attr.id}
              attrId={attr.id}
              attrIndex={attrIndex}
              variantIndex={variantIndex}
            />
          ))}
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-md border p-2">
          <h3 className="text-muted-foreground mb-2 text-xs font-medium">
            Pricing
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <PriceInput
              variantIndex={variantIndex}
              priceType="selling"
              label="Selling Price"
            />
            <PriceInput
              variantIndex={variantIndex}
              priceType="original"
              label="Original Price"
            />
          </div>
        </div>
        <div className="rounded-md border p-2">
          <h3 className="text-muted-foreground mb-2 text-xs font-medium">
            Inventory
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <StockInput variantIndex={variantIndex} />
            <SkuInput
              variantIndex={variantIndex}
              onGenerateSku={handleGenerateSku}
            />
          </div>
        </div>
      </div>
      {/* <DefaultVariantSwitch variantIndex={variantIndex} /> */}
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

    const fromFields = attrFields.some((field, index) => {
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
    const attributes = form.getValues("attributes") ?? [];
    variantFields.forEach((variant, variantIndex) => {
      const variantAttributes =
        form.getValues(`variants.${variantIndex}.attributes`) ?? [];
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
  }, [attributes, variantFields.length, hasVariant]);

  return (
    <Card className="h-fit md:col-span-2">
      <CardHeader>
        <CardTitle>Variants</CardTitle>
        <CardDescription>
          Configure each combination with its own details.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasValidAttributes && hasVariant && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>No attributes defined.</AlertTitle>
            <AlertDescription>
              <p>
                Please add at least one attribute with options before creating
                variants.
              </p>
            </AlertDescription>
          </Alert>
        )}
        {variantFields?.map((field, index) => (
          <Collapsible
            key={field.id}
            open={openStates[index]}
            onOpenChange={handleOpenChange(index)}
            disabled={!hasVariant}
            className="rounded-md border"
          >
            <VariantHeader
              index={index}
              variantLabel={variantLabels[index] ?? ''}
              hasVariant={Boolean(hasVariant)}
              canRemove={variantFields.length > 1}
              onRemove={handleVariantRemove(index)}
            />
            <VariantContent variantIndex={index} attrFields={attrFields} />
          </Collapsible>
        ))}

        <Button
          variant="outline"
          type="button"
          onClick={handleVariantAppend}
          disabled={!hasVariant || !hasValidAttributes}
        >
          <IconPlus className="size-4" />
          <span className="block">Add New Variant</span>
        </Button>
      </CardContent>
    </Card>
  );
}
