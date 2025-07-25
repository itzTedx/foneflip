"use client";

import { Header } from "@/components/layout/header";

import { Form, useForm, zodResolver } from "@ziron/ui/form";
import { ScrollArea, ScrollBar } from "@ziron/ui/scroll-area";
import { Tabs, TabsContent } from "@ziron/ui/tabs";
import { ProductFormType, productSchema } from "@ziron/validators";

interface Props {
  isEditMode: boolean;
}

export const ProductForm = ({ isEditMode }: Props) => {
  const form = useForm<ProductFormType>({
    resolver: zodResolver(productSchema),

    mode: "onTouched",
    // disabled: isArchived,
  });

  function onSubmit(values: ProductFormType) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="relative mx-auto max-w-7xl flex-1 pb-6"
      >
        <Header
          title={isEditMode ? "Edit Collection" : "Add Collection"}
          backLink="/collections"
        >
          <div className="flex items-center gap-3">
            {/* {isArchived ? (
          <RestoreArchiveButton
            onClick={handleRestore}
            isLoading={isRestorePending}
            disabled={form.formState.isSubmitting || isRestorePending}
          />
        ) : (
          <>
            <DraftButton
              type="button"
              disabled={
                form.formState.isSubmitting || isArchived || isDraftPending
              }
              onClick={onSaveDraft}
              isLoading={isDraftPending}
            />
            <SaveButton
              disabled={isArchived || isPending}
              isEditMode={isEditMode}
              isLoading={isPending}
            />
          </>
        )}*/}
          </div>
        </Header>

        <Tabs defaultValue="details" className="w-full">
          <ScrollArea>
            {/* <TabsTriggers tabTriggers={collectionTabs} disabled={isArchived} /> */}
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <div className="px-6">
            <TabsContent value="details"></TabsContent>

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
