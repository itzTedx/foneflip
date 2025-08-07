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
 * Formats file size in a human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Provides a UI component for uploading, previewing, and removing a single image file (thumbnail or banner) within a form.
 *
 * Supports drag-and-drop or browsing for image selection, displays upload progress, handles file validation and errors, and integrates with form state for value and error management. Allows users to remove the uploaded image or choose from existing media.
 *
 * Enhanced error handling includes:
 * - File size validation with human-readable size formatting
 * - File type validation for image files
 * - Network error handling with specific messages
 * - Upload timeout handling (30 seconds)
 * - HTTP status code specific error messages
 * - Metadata extraction error handling
 * - Checksum validation error handling
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
            // Validate file size
            if (file.size > maxSize) {
              const errorMessage = `File size (${formatFileSize(file.size)}) exceeds the maximum allowed size of ${maxSizeMB}MB`;
              form.setError(name, { message: errorMessage });
              onError(file, new Error(errorMessage));
              return;
            }

            // Validate file type
            if (!file.type.startsWith("image/")) {
              const errorMessage = "Invalid file type. Please upload an image file (JPEG, PNG, GIF, etc.)";
              form.setError(name, { message: errorMessage });
              onError(file, new Error(errorMessage));
              return;
            }

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
              form.setError(name, { message: signedUrl.message });
              onError(file, new Error(signedUrl.message));
              return;
            }

            if (signedUrl.success) {
              const url = signedUrl.success.url;
              const key = signedUrl.success.key;

              // Get image metadata (blurData, width, height)
              let metadata;
              try {
                metadata = await getImageMetadata(file);
              } catch (metadataError) {
                const errorMessage = `Failed to process image metadata: ${metadataError instanceof Error ? metadataError.message : "Unknown error"}`;
                form.setError(name, { message: errorMessage });
                onError(file, new Error(errorMessage));
                return;
              }

              const xhr = new XMLHttpRequest();
              xhr.open("PUT", url, true);
              xhr.setRequestHeader("Content-Type", file.type);
              xhr.setRequestHeader("Content-Language", file.size.toString());

              // Set timeout for upload
              xhr.timeout = 30000; // 30 seconds

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
                  onSuccess(file);
                } else {
                  let errorMessage = "Upload failed";
                  if (xhr.status === 413) {
                    errorMessage = "File too large for upload";
                  } else if (xhr.status === 401) {
                    errorMessage = "Authentication failed. Please try again";
                  } else if (xhr.status === 403) {
                    errorMessage = "Access denied. Please check your permissions";
                  } else if (xhr.status === 500) {
                    errorMessage = "Server error. Please try again later";
                  } else if (xhr.statusText) {
                    errorMessage = `Upload failed: ${xhr.statusText}`;
                  }
                  form.setError(name, { message: errorMessage });
                  onError(file, new Error(errorMessage));
                }
              };

              xhr.onerror = (error) => {
                const errorMessage = "Network error. Please check your connection and try again";
                form.setError(name, { message: errorMessage });
                onError(file, new Error(errorMessage));
              };

              xhr.ontimeout = () => {
                const errorMessage = "Upload timed out. Please try again";
                form.setError(name, { message: errorMessage });
                onError(file, new Error(errorMessage));
              };

              xhr.send(file);
            }
          } catch (error) {
            let errorMessage = "Upload failed";
            if (error instanceof Error) {
              if (error.message.includes("checksum")) {
                errorMessage = "File integrity check failed. Please try again";
              } else if (error.message.includes("network")) {
                errorMessage = "Network error. Please check your connection";
              } else {
                errorMessage = `Upload error: ${error.message}`;
              }
            }
            form.setError(name, { message: errorMessage });
            onError(file, new Error(errorMessage));
          }
        });

        // Wait for all uploads to complete
        await Promise.all(uploadPromises);
      } catch (error) {
        console.error("Unexpected error during upload:", error);
        const errorMessage = "An unexpected error occurred. Please try again";
        form.setError(name, { message: errorMessage });
      }
    },
    [form.clearErrors, form.setError, form.setValue, maxSize, maxSizeMB, name]
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
                  onFileReject={(file, message) => {
                    let errorMessage = message;

                    // Provide more specific error messages based on rejection reason
                    if (file.size > maxSize) {
                      errorMessage = `File size (${formatFileSize(file.size)}) exceeds the maximum allowed size of ${maxSizeMB}MB`;
                    } else if (!file.type.startsWith("image/")) {
                      errorMessage = `Invalid file type "${file.type}". Please upload an image file (JPEG, PNG, GIF, etc.)`;
                    } else if (message.includes("too many files")) {
                      errorMessage = `Only one image file is allowed for ${label.toLowerCase()}`;
                    } else if (message.includes("file type")) {
                      errorMessage = "Unsupported file type. Please upload a valid image file";
                    } else if (message.includes("too large")) {
                      errorMessage = `File size (${formatFileSize(file.size)}) exceeds the maximum allowed size of ${maxSizeMB}MB`;
                    } else if (message.includes("not accepted")) {
                      errorMessage = `Invalid file type "${file.type}". Please upload an image file (JPEG, PNG, GIF, etc.)`;
                    }

                    form.setError(name, {
                      message: errorMessage,
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
