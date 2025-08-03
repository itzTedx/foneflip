"use client";

import { useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";

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
import { Console } from "@/components/ui/notification-list";
import { Tabs, TabsContent, TabsTriggers } from "@/components/ui/tabs";
import { CollectionMetadata } from "@/modules/collections/types";

import { upsertProduct } from "../actions/mutations";
import { productErrorAtom } from "../atom";
import { PRODUCTS_TABS } from "../data/constants";
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
  initialData?: ProductFormType;
}

const LOCAL_STORAGE_KEY = "product-form-draft";

export const ProductForm = ({ isEditMode, collections, initialData }: Props) => {
  const lastProcessedValueRef = useRef<ProductFormType>(productFormDefaultValues);
  const setValidationError = useSetAtom(productErrorAtom);
  const [, setTitle] = useQueryState("title", parseAsString.withDefault(""));
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    setTitle(initialData?.title ?? null);
  }, []);

  const [draft, setDraft, removeDraft] = useLocalStorage<Partial<ProductFormType> | null>(LOCAL_STORAGE_KEY, null);

  const isArchived = false;
  const form = useForm<ProductFormType>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      ...productFormDefaultValues,
      ...initialData,
      ...draft,
    },
    mode: "onTouched",
    disabled: isArchived || isPending,
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
      form.handleSubmit(onSubmit)();
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

  // const formdata = form.watch();
  // const validation = validateForm(formdata, productSchema);
  // console.log(validation);

  /**
   * Handles form submission for the product form.
   */
  function onSubmit(values: ProductFormType) {
    startTransition(async () => {
      const res = await upsertProduct(values);
      if (!res.success) {
        toast.error("Something went wrong");
      }

      if (res.success) {
        removeDraft();
        const message = (res as { message?: string }).message;
        toast.success(typeof message === "string" ? message : "Product Updated successfully");
        router.push("/products");
      }
    });
  }

  /**
   * Handles the restore action for an archived product.
   */
  function handleRestore() {
    console.log("restore");
  }

  /**
   * Placeholder handler for saving the current form as a draft.
   */
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
                <ErrorDialog />
                {isArchived ? (
                  <RestoreArchiveButton disabled={false} isLoading={false} onClick={handleRestore} />
                ) : (
                  <>
                    <DraftButton
                      disabled={form.formState.isSubmitting || isArchived || isPending}
                      isLoading={false}
                      onClick={onSaveDraft}
                      type="button"
                    />
                    <SaveButton
                      disabled={isArchived || isPending}
                      isEditMode={isEditMode}
                      isLoading={isPending}
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
        <Console />
      </form>
    </Form>
  );
};
