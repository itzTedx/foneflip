"use client";

import { Header } from "@/components/layout/header";
import { Tabs, TabsContent, TabsTriggers } from "@/components/ui/tabs";

import { DraftButton, RestoreArchiveButton, SaveButton } from "@/components/ui/action-buttons";
import { CollectionMetadata } from "@/modules/collections/types";
import { Form, useForm, zodResolver } from "@ziron/ui/form";
import { useHotkey } from "@ziron/ui/hooks/use-hotkey";
import { useLocalStorage } from "@ziron/ui/hooks/use-local-storage";
import { ScrollArea, ScrollBar } from "@ziron/ui/scroll-area";
import { CollectionFormType, ProductFormType, productSchema } from "@ziron/validators";


import { parseAsString, useQueryState } from "nuqs";
import { useEffect } from "react";
import { PRODUCTS_TABS } from "../data/constants";
import { Product } from "../types";
import { getDefaultValues } from "../utils/helper";
import { ProductInfo } from "./form-sections/info";
import { ProductMedia } from "./form-sections/media";
import { ProductSeo } from "./form-sections/seo";
import { ProductSettings } from "./form-sections/settings";
import { ProductSpecifications } from "./form-sections/specifications";
import { ProductVariants } from "./form-sections/variants";

interface Props {
  isEditMode: boolean;
  collections: CollectionMetadata[]
  initialData?: Product
}

const LOCAL_STORAGE_KEY = "product-form-draft";

export const ProductForm = ({ isEditMode, collections, initialData }: Props) => {
  const [, setTitle] = useQueryState("title", parseAsString.withDefault(""));

  useEffect(() => {
    setTitle(initialData?.title ?? null);
  }, []);

  const [draft, setDraft, removeDraft] =
  useLocalStorage<Partial<CollectionFormType> | null>(
    LOCAL_STORAGE_KEY,
    null,
  );

  const isArchived = false
  const form = useForm<ProductFormType>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      ...getDefaultValues(),
      ...draft
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
    callback: form.handleSubmit(onSubmit),
    throttleMs: 2000,
  });
   
  
  // const formdata = form.watch(() => {})
 
  // const validation = validateForm(formdata, productSchema)
  // console.log(validation.error)

  useEffect(() => {
    const subscription = form.watch((values) => {
      if (!isEditMode) {
      
        setDraft(values as Partial<CollectionFormType>);
      }
    });
    if (isEditMode) removeDraft();
    return () => subscription.unsubscribe();
  }, [form, isEditMode, setDraft]);

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
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="relative mx-auto max-w-7xl flex-1 pb-6"
      >
        <Header
          title={isEditMode ? "Edit Product" : "Add Product"}
          backLink="/products"
        >
          <div className="flex items-center gap-3">
            {isArchived ? (
          <RestoreArchiveButton
            onClick={handleRestore}
            isLoading={false}
            disabled={false}
          />
        ) : (
          <>
            <DraftButton
              type="button"
              disabled={
                form.formState.isSubmitting || isArchived || false
              }
              onClick={onSaveDraft}
              isLoading={false}
            />
            <SaveButton title="Product"
              disabled={isArchived || false}
              isEditMode={isEditMode}
              isLoading={false}
            />
          </>
        )}
          </div>
        </Header>

        <Tabs defaultValue="info" className="w-full">
        <div className="sticky top-[calc(3.75rem+3rem+1px)] z-50">
            <ScrollArea>
              <TabsTriggers tabTriggers={PRODUCTS_TABS} showSettings={true} />
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
              <ProductVariants isEditMode={isEditMode} hasVariant={hasVariant} />
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
