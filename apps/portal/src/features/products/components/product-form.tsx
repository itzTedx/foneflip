"use client";

import { Header } from "@/components/layout/header";
import { Tabs, TabsContent, TabsTriggers } from "@/components/ui/tabs";

import { DraftButton, RestoreArchiveButton, SaveButton } from "@/components/ui/action-buttons";
import { Form, useForm, zodResolver } from "@ziron/ui/form";
import { ScrollArea, ScrollBar } from "@ziron/ui/scroll-area";
import { ProductFormType, productSchema } from "@ziron/validators";
import { PRODUCTS_TABS } from "../data/constants";
import { ProductDetails } from "./form-sections/info";

interface Props {
  isEditMode: boolean;
}

export const ProductForm = ({ isEditMode }: Props) => {
  const isArchived = false
  const form = useForm<ProductFormType>({
    resolver: zodResolver(productSchema),

    mode: "onTouched",
    disabled: isArchived,
  });

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
            <SaveButton
              disabled={isArchived || false}
              isEditMode={isEditMode}
              isLoading={false}
            />
          </>
        )}
          </div>
        </Header>

        <Tabs defaultValue="info" className="w-full">
          <ScrollArea>
            <TabsTriggers tabTriggers={PRODUCTS_TABS} disabled={false} />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <div className="px-6">
            <TabsContent value="info">
              <ProductDetails />
            </TabsContent>

            <TabsContent value="media"></TabsContent>

            <TabsContent value="products"></TabsContent>

            <TabsContent value="seo"></TabsContent>

            <TabsContent value="settings"></TabsContent>
          </div>
        </Tabs>
      </form>
    </Form>
  );
};
