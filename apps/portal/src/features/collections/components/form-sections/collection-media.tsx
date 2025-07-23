"use client";

import { memo, useCallback, useState } from "react";
import { TabNavigation } from "@/components/layout/tab-navigation";
import { InfoTooltip } from "@/components/ui/tooltip";
import { CloudUpload, X } from "lucide-react";
import { parseAsBoolean, useQueryState } from "nuqs";
import { useFormContext } from "react-hook-form";

import { Button } from "@ziron/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ziron/ui/components/card";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadProps,
  FileUploadTrigger,
} from "@ziron/ui/components/file-upload";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@ziron/ui/components/form";
import { CollectionFormType } from "@ziron/validators";

// Reusable component for media upload and preview
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
  const [files, setFiles] = useState<File[]>([]);
  // Dialog state for selecting existing media
  const [mediaDialog, setMediaDialog] = useQueryState(
    `${name}-media-dialog`,
    parseAsBoolean.withDefault(false),
  );
  const maxSizeMB = 4;
  const maxSize = maxSizeMB * 1024 * 1024; // 2MB default

  const onUpload: NonNullable<FileUploadProps["onUpload"]> = useCallback(
    async (files, { onProgress, onSuccess, onError }) => {
      try {
        // Process each file individually
        const uploadPromises = files.map(async (file) => {
          try {
            // Simulate file upload with progress
            const totalChunks = 10;
            let uploadedChunks = 0;

            // Simulate chunk upload with delays
            for (let i = 0; i < totalChunks; i++) {
              // Simulate network delay (100-300ms per chunk)
              await new Promise((resolve) =>
                setTimeout(resolve, Math.random() * 200 + 100),
              );

              // Update progress for this specific file
              uploadedChunks++;
              const progress = (uploadedChunks / totalChunks) * 100;
              onProgress(file, progress);
            }

            // Simulate server processing delay
            await new Promise((resolve) => setTimeout(resolve, 500));
            onSuccess(file);
          } catch (error) {
            onError(
              file,
              error instanceof Error ? error : new Error("Upload failed"),
            );
          }
        });

        // Wait for all uploads to complete
        await Promise.all(uploadPromises);
      } catch (error) {
        // This handles any error that might occur outside the individual upload processes
        console.error("Unexpected error during upload:", error);
      }
    },
    [],
  );

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        <CardDescription>
          {name === "thumbnail"
            ? "Shown in listings, cards, or menus."
            : "For featured layout or header banner."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name={`${name}.image`}
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>
                  Upload {label} <InfoTooltip info={tooltip} />
                </FormLabel>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground text-xs"
                  onClick={() => setMediaDialog(true)}
                >
                  Choose from existing
                </Button>
              </div>
              <FormControl>
                <FileUpload
                  value={files}
                  onValueChange={setFiles}
                  accept="image/*"
                  maxFiles={1}
                  maxSize={maxSize}
                  onUpload={onUpload}
                  onFileReject={(_, message) => {
                    form.setError(name, {
                      message,
                    });
                  }}
                >
                  <FileUploadDropzone className="flex-row flex-wrap border-dotted text-center">
                    <CloudUpload className="size-4" />
                    Drag and drop or
                    <FileUploadTrigger asChild>
                      <Button variant="link" size="sm" className="p-0">
                        choose files
                      </Button>
                    </FileUploadTrigger>
                    to upload
                  </FileUploadDropzone>
                  <FileUploadList>
                    {files.map((file) => (
                      <FileUploadItem value={file} key={file.name}>
                        <FileUploadItemPreview />

                        <FileUploadItemMetadata />
                        <FileUploadItemDelete asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                          >
                            <X />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </FileUploadItemDelete>
                      </FileUploadItem>
                    ))}
                  </FileUploadList>
                </FileUpload>
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
        <h2 className="px-2 text-lg font-medium">Banner and Thumbnail</h2>
        <TabNavigation currentTab="media" type="collections" />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <MediaUploadPreview
          label="Thumbnail"
          name="thumbnail"
          value={thumbnail}
          onRemove={handleRemoveThumbnail}
          form={form}
          tooltip="This wil show as a thumbnail for this category in the storefront"
        />
        <MediaUploadPreview
          label="Banner"
          name="banner"
          value={banner}
          onRemove={handleRemoveBanner}
          form={form}
          tooltip="This wil show as a Banner below or above the collection in homepage and in the individual collection page."
        />
      </div>
    </>
  );
});
