"use client";

import { memo, useCallback } from "react";

import { useUploadFile } from "better-upload/client";
import { parseAsBoolean, useQueryState } from "nuqs";

import { Button } from "@ziron/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ziron/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, useFormContext } from "@ziron/ui/form";
import { CollectionFormType } from "@ziron/validators";

import { TabNavigation } from "@/components/ui/tab-navigation";
import { InfoTooltip } from "@/components/ui/tooltip";
import { UploadDropzone } from "@/components/ui/upload-dropzone";
import { getImageMetadata } from "@/modules/media/utils/get-image-data";

import { ImagePreview } from "./ui/image-preview";

function MediaUploadPreview({
  label,
  name,
  value,
  onRemove,
  form,
  tooltip,
}: {
  label: string;
  name: "thumbnail" | "banner";
  tooltip: string;
  value: CollectionFormType["thumbnail"] | null;
  onRemove: () => void;
  form: ReturnType<typeof useFormContext<CollectionFormType>>;
}) {
  // Dialog state for selecting existing media
  const [_mediaDialog, setMediaDialog] = useQueryState(`${name}-media-dialog`, parseAsBoolean.withDefault(false));

  const { control } = useUploadFile({
    route: "collection",
    onUploadComplete: async ({ file, metadata: objectMetadata }) => {
      const metadata = await getImageMetadata(file.raw);

      form.setValue(name, {
        file: {
          url: objectMetadata.url as string,
          key: file.objectKey,
          name: file.name,
          size: file.size,
        },
        metadata,
      });
    },
    onError: (error) => {
      form.setError(name, {
        message: error.message || "An error occurred",
      });
    },
  });

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        <CardDescription>
          {name === "thumbnail" ? "Shown in listings, cards, or menus." : "For featured layout or header banner."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name={name}
          render={() => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>
                  Upload {label} <InfoTooltip info={tooltip} />
                </FormLabel>

                <Button
                  className="text-muted-foreground text-xs"
                  onClick={() => setMediaDialog(true)}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  Choose from existing
                </Button>
              </div>
              <FormControl>
                {value ? (
                  <div className="flex flex-col">
                    <ImagePreview files={[]} name={name} onRemove={onRemove} value={value} />
                  </div>
                ) : (
                  <UploadDropzone
                    accept="image/*"
                    control={control}
                    description={{
                      maxFiles: 1,
                      maxFileSize: "5MB",
                      fileTypes: "JPEG, PNG, WEBP",
                    }}
                  />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}

export const CollectionMedia = memo(function CollectionMedia() {
  const form = useFormContext<CollectionFormType>();
  const thumbnail = form.watch("thumbnail");
  const banner = form.watch("banner");

  // Remove handlers
  const handleRemoveThumbnail = useCallback(() => {
    form.setValue("thumbnail", undefined);
  }, [form]);
  const handleRemoveBanner = useCallback(() => {
    form.setValue("banner", undefined);
  }, [form]);

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="px-2 font-medium text-lg">Banner and Thumbnail</h2>
        <TabNavigation currentTab="media" type="collections" />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <MediaUploadPreview
          form={form}
          label="Thumbnail"
          name="thumbnail"
          onRemove={handleRemoveThumbnail}
          tooltip="This wil show as a thumbnail for this category in the storefront"
          value={thumbnail}
        />
        <MediaUploadPreview
          form={form}
          label="Banner"
          name="banner"
          onRemove={handleRemoveBanner}
          tooltip="This wil show as a Banner below or above the collection in homepage and in the individual collection page."
          value={banner}
        />
      </div>
    </>
  );
});
