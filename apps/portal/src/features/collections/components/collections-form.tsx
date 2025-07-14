"use client";

import { useTransition } from "react";
import { Header } from "@/components/layout/header";
import { IconCheck, IconDeviceFloppy } from "@tabler/icons-react";

import { Button } from "@ziron/ui/components/button";
import { Form, useForm, zodResolver } from "@ziron/ui/components/form";
import { LoadingSwap } from "@ziron/ui/components/loading-swap";
import { Tabs, TabsContent } from "@ziron/ui/components/tabs";
import { useLocalStorage } from "@ziron/ui/hooks/use-local-storage";
import { CollectionFormType, collectionSchema } from "@ziron/validators";

import { upsertCollection } from "../actions/mutations";
import { collectionTabs } from "../data/constants";
import { getDefaultValues } from "../utils/helper";
import { CollectionDetails } from "./form-sections/collection-details";
import { TabsTriggers } from "./ui/tabs";

interface Props {
  isEditMode: boolean;
  initialData:
    | CollectionFormType
    // & { products?: ProductType[] }
    | null;
}

const LOCAL_STORAGE_KEY = "collection-form-draft";

export const CollectionForm = ({ isEditMode, initialData }: Props) => {
  const [isPending, startTransition] = useTransition();

  const [draft, setDraft, removeDraft] =
    useLocalStorage<Partial<CollectionFormType> | null>(
      LOCAL_STORAGE_KEY,
      null,
    );

  const form = useForm<CollectionFormType>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      ...getDefaultValues(),
      ...initialData,
      ...draft,
      meta: {
        ...getDefaultValues().meta,
        ...(initialData?.meta || {}),
        ...(draft?.meta || {}),
      },
      settings: {
        ...getDefaultValues().settings,
        ...(initialData?.settings || {}),
        ...(draft?.settings || {}),
      },
    },
  });
  const isArchived = initialData?.settings?.status === "archived";

  form.watch((values) => {
    setDraft(values as Partial<CollectionFormType>);
  });

  function onSubmit(values: CollectionFormType) {
    startTransition(() => {
      upsertCollection({
        ...values,
        settings: {
          ...values.settings,
          status: "active",
        },
      });

      removeDraft();
    });
  }

  // const data = form.watch();
  // const validation = validateForm(data, collectionSchema);

  // console.info("validate form data: ", validation);
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="relative mx-auto max-w-7xl flex-1 pb-6"
      >
        <Header title={isEditMode ? "Edit Collection" : "Add Collection"}>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              type="button"
              // onClick={onSaveDraft}
              disabled={form.formState.isSubmitting || isArchived}
            >
              <LoadingSwap
                isLoading={false}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <IconDeviceFloppy className="text-muted-foreground -ml-1 size-4" />
                <div>
                  <span className="hidden sm:inline">Save as </span>Draft
                </div>
              </LoadingSwap>
            </Button>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting || isArchived}
            >
              <LoadingSwap
                isLoading={isPending}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <IconCheck className="-ml-1 size-4" />
                {isEditMode ? (
                  <span>
                    Save <span className="hidden sm:inline">Changes</span>
                  </span>
                ) : (
                  <span>
                    Create <span className="hidden sm:inline">Collection</span>
                  </span>
                )}
              </LoadingSwap>
            </Button>
          </div>
        </Header>

        <Tabs defaultValue="details" className="w-full">
          <TabsTriggers tabTriggers={collectionTabs} />
          <div className="px-6">
            <TabsContent value="details">
              <CollectionDetails />
            </TabsContent>

            <TabsContent value="media">{/* <CollectionMedia /> */}</TabsContent>

            <TabsContent value="products">
              {/* <CollectionProducts products={initialData?.products} /> */}
            </TabsContent>

            <TabsContent value="seo">{/* <CollectionSEO /> */}</TabsContent>

            <TabsContent value="settings">
              {/* <CollectionSettings /> */}
            </TabsContent>
          </div>
        </Tabs>
      </form>
    </Form>
  );
};
