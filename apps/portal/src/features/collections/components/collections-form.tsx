"use client";

import { useEffect, useTransition } from "react";
import { Header } from "@/components/layout/header";
import { useRouter } from "@bprogress/next";
import { IconRestore } from "@tabler/icons-react";
import { parseAsString, useQueryState } from "nuqs";

import { IconFileEditFilled, IconSaveFilled } from "@ziron/ui/assets/icons";
import { Button } from "@ziron/ui/components/button";
import { Form, useForm, zodResolver } from "@ziron/ui/components/form";
import { LoadingSwap } from "@ziron/ui/components/loading-swap";
import { ScrollArea } from "@ziron/ui/components/scroll-area";
import { toast } from "@ziron/ui/components/sonner";
import { Tabs, TabsContent } from "@ziron/ui/components/tabs";
import { useLocalStorage } from "@ziron/ui/hooks/use-local-storage";
import { CollectionFormType, collectionSchema } from "@ziron/validators";

import {
  saveCollectionDraft,
  setCollectionStatus,
  upsertCollection,
} from "../actions/mutations";
import { collectionTabs } from "../data/constants";
import { getDefaultValues } from "../utils/helper";
import { CollectionDetails } from "./form-sections/collection-details";
import { CollectionMedia } from "./form-sections/collection-media";
import { CollectionSEO } from "./form-sections/collection-seo";
import { CollectionSettings } from "./form-sections/collection-settings";
import { TabsTriggers } from "./ui/tabs";

interface Props {
  isEditMode: boolean;
  initialData:
    | (CollectionFormType & { updatedAt?: Date })
    // & { products?: ProductType[] }
    | null;
}

const LOCAL_STORAGE_KEY = "collection-form-draft";

export const CollectionForm = ({ isEditMode, initialData }: Props) => {
  const [, setTitle] = useQueryState("title", parseAsString.withDefault(""));
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDraftPending, startDraftTransition] = useTransition();
  const [isRestorePending, startRestoreTransition] = useTransition();

  const [draft, setDraft, removeDraft] =
    useLocalStorage<Partial<CollectionFormType> | null>(
      LOCAL_STORAGE_KEY,
      null,
    );
  const isArchived = initialData?.settings?.status === "archived";

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
    mode: "onTouched",
    disabled: isArchived,
  });

  useEffect(() => {
    setTitle(initialData?.title ?? null);
  }, []);

  useEffect(() => {
    const subscription = form.watch((values) => {
      if (!isEditMode) {
        setDraft(values as Partial<CollectionFormType>);
      }
    });
    if (isEditMode) removeDraft();
    return () => subscription.unsubscribe();
  }, [form, isEditMode, setDraft]);

  function handleRestore() {
    startRestoreTransition(async () => {
      const result = await setCollectionStatus(initialData?.id, "active");
      if (result.success) {
        const message = (result as { message?: string }).message;

        toast.success(
          typeof message === "string"
            ? message
            : "Collection status changed successfully",
        );
      }
      if (!result.success) {
        const message = (result as { message?: string }).message;
        toast.error(
          typeof message === "string" ? message : "An error occurred",
        );
      }
    });
  }

  function onSubmit(values: CollectionFormType) {
    startTransition(async () => {
      const result = await upsertCollection({
        ...values,
        settings: {
          ...values.settings,
          status: "active",
        },
      });
      if (result.success) {
        const message = (result as { message?: string }).message;
        removeDraft();
        toast.success(
          typeof message === "string"
            ? message
            : "Collection Updated successfully",
        );
        router.push("/collections");
      }
      if (!result.success) {
        const message = (result as { message?: string }).message;
        toast.error(
          typeof message === "string" ? message : "An error occurred",
        );
      }
    });
  }

  function onSaveDraft() {
    startDraftTransition(async () => {
      const values = form.getValues();
      const result = await saveCollectionDraft({
        ...values,
        settings: {
          ...values.settings,
          status: "draft",
        },
      });
      if (result.success) {
        const message = (result as { message?: string }).message;
        removeDraft();
        toast.success(
          typeof message === "string" ? message : "Collection Saved on draft",
        );
        router.push("/collections");
      }
      if (!result.success) {
        const message = (result as { message?: string }).message;
        toast.error(
          typeof message === "string" ? message : "An error occurred",
        );
      }
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
            {isArchived ? (
              <Button
                variant="outline"
                type="button"
                onClick={handleRestore}
                disabled={form.formState.isSubmitting || isRestorePending}
              >
                <LoadingSwap
                  isLoading={isRestorePending}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <IconRestore className="text-muted-foreground -ml-1 size-4" />
                  <div>
                    Restore{" "}
                    <span className="hidden sm:inline">from archive</span>
                  </div>
                </LoadingSwap>
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  type="button"
                  onClick={onSaveDraft}
                  disabled={
                    form.formState.isSubmitting || isArchived || isDraftPending
                  }
                >
                  <LoadingSwap
                    isLoading={isDraftPending}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <IconFileEditFilled className="text-muted-foreground -ml-1 size-4" />
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
                    <IconSaveFilled className="-ml-1 size-4" />
                    {isEditMode ? (
                      <span>
                        Save <span className="hidden sm:inline">Changes</span>
                      </span>
                    ) : (
                      <span>
                        Create{" "}
                        <span className="hidden sm:inline">Collection</span>
                      </span>
                    )}
                  </LoadingSwap>
                </Button>
              </>
            )}
          </div>
        </Header>

        <Tabs defaultValue="details" className="w-full">
          <ScrollArea>
            <TabsTriggers tabTriggers={collectionTabs} disabled={isArchived} />
          </ScrollArea>
          <div className="px-6">
            <TabsContent value="details">
              <CollectionDetails />
            </TabsContent>

            <TabsContent value="media">
              <CollectionMedia />
            </TabsContent>

            <TabsContent value="products">
              {/* <CollectionProducts products={initialData?.products} /> */}
            </TabsContent>

            <TabsContent value="seo">
              <CollectionSEO />
            </TabsContent>

            <TabsContent value="settings">
              <CollectionSettings
                updatedAt={initialData?.updatedAt}
                isEditMode={isEditMode}
              />
            </TabsContent>
          </div>
        </Tabs>
        {/* <pre>{JSON.stringify(initialData, null, 2)}</pre> */}
      </form>
    </Form>
  );
};
