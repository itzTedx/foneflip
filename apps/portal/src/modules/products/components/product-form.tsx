"use client";

import { useEffect, useRef } from "react";

import { useSetAtom } from "jotai";
import { cloneDeep, debounce, isEqual } from "lodash";
import { parseAsString, useQueryState } from "nuqs";
import { toast } from "sonner";

import { Form, useForm, zodResolver } from "@ziron/ui/form";
import { useHotkey } from "@ziron/ui/hooks/use-hotkey";
import { useLocalStorage } from "@ziron/ui/hooks/use-local-storage";
import { ScrollArea, ScrollBar } from "@ziron/ui/scroll-area";
import { ProductFormType, productSchema } from "@ziron/validators";

import { Header } from "@/components/layout/header";
import { DraftButton, RestoreArchiveButton, SaveButton } from "@/components/ui/action-buttons";
import { Tabs, TabsContent, TabsTriggers } from "@/components/ui/tabs";
import { CollectionMetadata } from "@/modules/collections/types";

import { productErrorAtom } from "../atom";
import { PRODUCTS_TABS } from "../data/constants";
import { Product } from "../types";
import { productFormDefaultValues } from "../utils/helper";
import { ProductInfo } from "./form-sections/info";
import { ProductMedia } from "./form-sections/media";
import { ProductSeo } from "./form-sections/seo";
import { ProductSettings } from "./form-sections/settings";
import { ProductSpecifications } from "./form-sections/specifications";
import { ProductVariants } from "./form-sections/variants";
import { ErrorDialog } from "./ui/error-dialog";

interface Props {
  isEditMode: boolean;
  collections: CollectionMetadata[];
  initialData?: Product;
}

const LOCAL_STORAGE_KEY = "product-form-draft";

export const ProductForm = ({ isEditMode, collections, initialData }: Props) => {
  const lastProcessedValueRef = useRef<ProductFormType>(productFormDefaultValues);
  const setValidationError = useSetAtom(productErrorAtom);
  const [, setTitle] = useQueryState("title", parseAsString.withDefault(""));

  useEffect(() => {
    setTitle(initialData?.title ?? null);
  }, []);

  const [draft, setDraft, removeDraft] = useLocalStorage<Partial<ProductFormType> | null>(LOCAL_STORAGE_KEY, null);

  const isArchived = false;
  const form = useForm<ProductFormType>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      ...productFormDefaultValues,
      ...draft,
    },
    mode: "onTouched",
    disabled: isArchived,
  });

  const hasVariant = form.watch("hasVariant");

  // Handle Ctrl+S keyboard shortcut
  useHotkey({
    combos: [
      { key: "s", ctrl: true },
      { key: "s", meta: true },
    ],
    enabled: true,
    condition: () => !form.formState.isSubmitting && !isArchived,
    callback: () => {
      toast.success("Saving....");
      form.handleSubmit(onSubmit);
    },
    throttleMs: 2000,
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: Unknown
  useEffect(() => {
    const formValue = (values: ProductFormType) => {
      if (isEqual(values, lastProcessedValueRef.current)) return; // skip unnecessary updates
      lastProcessedValueRef.current = cloneDeep(values);

      // First verify the data if it matches the schema
      const validation = productSchema.safeParse(values);
      // If the data is valid, set the data to invoice and clear the errors
      if (validation.success) {
        setValidationError([]);
      } else {
        setValidationError(validation.error.issues);
      }
    };

    // Create a debounced version of the processing function
    const debouncedFormValue = debounce(formValue, 500);

    const subscription = form.watch((values) => {
      debouncedFormValue(values as ProductFormType);
      if (!isEditMode) {
        setDraft(values as Partial<ProductFormType>);
      }

      if (isEditMode) removeDraft();
    });

    return () => {
      subscription.unsubscribe();
      debouncedFormValue.cancel();
    };
  }, [form]);

  function onSubmit(values: ProductFormType) {
    console.log(values);
  }

  function handleRestore() {
    console.log("restore");
  }

  function onSaveDraft() {
    console.log("restore");
  }

  return (
    <Form {...form}>
      <form className="relative mx-auto max-w-7xl flex-1 pb-6" onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs className="w-full" defaultValue="info">
          <div className="sticky top-[calc(3rem+1px)] z-99 bg-background/80 backdrop-blur-xl">
            <Header backLink="/products" title={isEditMode ? "Edit Product" : "Add Product"}>
              <div className="flex items-center gap-3">
                {isArchived ? (
                  <RestoreArchiveButton disabled={false} isLoading={false} onClick={handleRestore} />
                ) : (
                  <>
                    <ErrorDialog />
                    <DraftButton
                      disabled={form.formState.isSubmitting || isArchived}
                      isLoading={false}
                      onClick={onSaveDraft}
                      type="button"
                    />
                    <SaveButton
                      disabled={isArchived || false}
                      isEditMode={isEditMode}
                      isLoading={false}
                      title="Product"
                    />
                  </>
                )}
              </div>
            </Header>
            <ScrollArea>
              <TabsTriggers showSettings={true} tabTriggers={PRODUCTS_TABS} />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
          <div className="px-6">
            <TabsContent value="info">
              <ProductInfo collections={collections} />
            </TabsContent>

            <TabsContent value="media">
              <ProductMedia />
            </TabsContent>

            <TabsContent value="variants">
              <ProductVariants hasVariant={hasVariant} isEditMode={isEditMode} />
            </TabsContent>

            <TabsContent value="specifications">
              <ProductSpecifications isEditMode={isEditMode} />
            </TabsContent>

            <TabsContent value="seo">
              <ProductSeo />
            </TabsContent>

            <TabsContent value="settings">
              <ProductSettings />
            </TabsContent>
          </div>
        </Tabs>
      </form>
    </Form>
  );
};
