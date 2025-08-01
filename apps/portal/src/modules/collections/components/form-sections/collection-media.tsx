"use client";

import { memo, useCallback, useState } from "react";

import { IconX } from "@tabler/icons-react";
import { Upload } from "lucide-react";
import { parseAsBoolean, useQueryState } from "nuqs";

import { Button } from "@ziron/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ziron/ui/card";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadItemProgress,
  FileUploadList,
  FileUploadProps,
  FileUploadTrigger,
} from "@ziron/ui/file-upload";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, useFormContext } from "@ziron/ui/form";
import { CollectionFormType } from "@ziron/validators";

import { TabNavigation } from "@/components/ui/tab-navigation";
import { InfoTooltip } from "@/components/ui/tooltip";
import { getSignedURL } from "@/modules/media/actions/mutations";
import { computeSHA256 } from "@/modules/media/utils/compute-sha256";
import { getImageMetadata } from "@/modules/media/utils/get-image-data";

import { ImagePreview } from "./ui/image-preview";

/**
 * Provides a UI component for uploading, previewing, and removing a single image file (thumbnail or banner) within a form.
 *
 * Supports drag-and-drop or browsing for image selection, displays upload progress, handles file validation and errors, and integrates with form state for value and error management. Allows users to remove the uploaded image or choose from existing media.
 *
 * @param label - The display label for the upload section.
 * @param name - The form field name, either "thumbnail" or "banner".
 * @param tooltip - Tooltip text explaining the upload field.
 * @param value - The current value of the media file from the form.
 * @param onRemove - Callback to remove the current media.
 * @param form - The form context object for managing form state and errors.
 */
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
  const [_mediaDialog, setMediaDialog] = useQueryState(`${name}-media-dialog`, parseAsBoolean.withDefault(false));
  const maxSizeMB = 4;
  const maxSize = maxSizeMB * 1024 * 1024; // 2MB default

  const onUpload: NonNullable<FileUploadProps["onUpload"]> = useCallback(
    async (files, { onProgress, onSuccess, onError }) => {
      try {
        // Process each file individually

        const uploadPromises = files.map(async (file) => {
          try {
            const checksum = await computeSHA256(file);

            const signedUrl = await getSignedURL({
              file: {
                type: file.type,
                size: file.size,
                fileName: file.name,
              },
              collection: name,
              checksum: checksum,
            });

            if (signedUrl.error !== undefined) {
              form.setError(name, new Error(signedUrl.message));
            }

            if (signedUrl.success) {
              const url = signedUrl.success.url;
              const key = signedUrl.success.key;

              // Get image metadata (blurData, width, height)
              const metadata = await getImageMetadata(file);

              const xhr = new XMLHttpRequest();
              xhr.open("PUT", url, true);
              xhr.setRequestHeader("Content-Type", file.type);
              xhr.setRequestHeader("Content-Language", file.size.toString());
              xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                  const progress = (event.loaded / event.total) * 100;
                  onProgress(file, progress);
                }
              };

              xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                  form.clearErrors(name);
                  form.setValue(name, {
                    file: {
                      url: url.split("?")[0] ?? "",
                      name: file.name,
                      size: file.size,
                      key: key,
                    },
                    metadata: {
                      ...metadata,
                    },
                  });
                } else {
                  form.setError(name, new Error("Upload failed"));
                }
              };

              xhr.onerror = (error) => {
                form.setError(name, new Error("Upload error"));
                onError(file, error instanceof Error ? error : new Error("Upload failed"));
              };

              xhr.send(file);
              onSuccess(file);
            }
          } catch (error) {
            onError(file, error instanceof Error ? error : new Error("Upload failed"));
          }
        });

        // Wait for all uploads to complete
        await Promise.all(uploadPromises);
      } catch (error) {
        console.error("Unexpected error during upload:", error);
      }
    },
    [form.clearErrors]
  );

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
                <FileUpload
                  accept="image/*"
                  maxFiles={1}
                  maxSize={maxSize}
                  onFileReject={(_, message) => {
                    form.setError(name, {
                      message,
                    });
                  }}
                  onUpload={onUpload}
                  onValueChange={setFiles}
                  value={files}
                >
                  {value ? (
                    <ImagePreview files={files} name={name} onRemove={onRemove} value={value} />
                  ) : (
                    <FileUploadDropzone className="relative flex select-none flex-col items-center justify-center gap-2 rounded-lg border-dashed py-12 outline-none transition-colors hover:bg-accent/30 focus-visible:border-ring/50 data-[disabled]:pointer-events-none data-[dragging]:border-primary data-[invalid]:border-destructive data-[dragging]:bg-accent/30 data-[invalid]:ring-destructive/20">
                      <div className="flex flex-col items-center gap-1 text-center">
                        <div className="flex items-center justify-center rounded-full border p-2.5">
                          <Upload className="size-6 text-muted-foreground" />
                        </div>
                        <p className="font-medium text-sm">Drag & drop image here</p>
                        <p className="text-muted-foreground text-xs">Or click to browse</p>
                      </div>
                      <FileUploadTrigger asChild>
                        <Button className="mt-2 w-fit" size="sm" variant="outline">
                          Browse files
                        </Button>
                      </FileUploadTrigger>
                      <FileUploadList orientation="horizontal">
                        {files.map((file, index) => {
                          // console.log(file);
                          return (
                            <FileUploadItem className="p-0" key={index} value={file}>
                              <FileUploadItemPreview className="size-20 [&>svg]:size-12">
                                <FileUploadItemProgress size={30} variant="circular" />
                              </FileUploadItemPreview>
                              <FileUploadItemMetadata />
                              <FileUploadItemDelete asChild>
                                <Button
                                  className="-top-1 -right-1 absolute size-5 rounded-full"
                                  size="icon"
                                  variant="secondary"
                                >
                                  <IconX className="size-3" />
                                </Button>
                              </FileUploadItemDelete>
                            </FileUploadItem>
                          );
                        })}
                      </FileUploadList>
                    </FileUploadDropzone>
                  )}
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
