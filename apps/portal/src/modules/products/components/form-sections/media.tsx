"use client";

import { useCallback, useEffect, useState } from "react";

import { IconX } from "@tabler/icons-react";
import { Upload } from "lucide-react";
import { parseAsBoolean, useQueryState } from "nuqs";
import { toast } from "sonner";

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
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFieldArray,
  useFormContext,
} from "@ziron/ui/form";
import { pluralize } from "@ziron/utils";
import { ProductFormType } from "@ziron/validators";

import { TabNavigation } from "@/components/ui/tab-navigation";
import { Media } from "@/modules/collections/types";
import { getSignedURL } from "@/modules/media/actions/mutations";
import { MediaPickerModal } from "@/modules/media/components/media-picker";
import { computeSHA256 } from "@/modules/media/utils/compute-sha256";
import { getImageMetadata } from "@/modules/media/utils/get-image-data";

import { UploadedImagesList } from "./fields/media/uploaded-images-list";

/**
 * Renders the product image gallery section within a product form, providing upload, selection, preview, drag-and-drop reordering, featuring, and removal of images.
 *
 * Integrates with form state to manage a dynamic array of images, allowing users to upload new images, select from existing media, mark one image as featured, remove individual or all images, and reorder images via drag-and-drop. Displays image previews with metadata and provides a drag overlay during reordering.
 */
export function ProductMedia() {
  const form = useFormContext<ProductFormType>();
  const [files, setFiles] = useState<File[]>([]);
  const maxSizeMB = 4;
  const maxSize = maxSizeMB * 1024 * 1024; // 4MB default

  const { fields, remove, append, move } = useFieldArray({
    control: form.control,
    name: "images",
  });

  // Clear files state when images are removed
  useEffect(() => {
    if (fields.length === 0) {
      setFiles([]);
    }
  }, [fields.length]);

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
              collection: "product",
              checksum: checksum,
            });

            if (signedUrl.error !== undefined) {
              form.setError("images", new Error(signedUrl.message));
              return;
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
                  form.clearErrors("images");

                  // Add the uploaded image to the form
                  append({
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
                  setFiles([]);
                } else {
                  form.setError("images", new Error("Upload failed"));
                  onError(file, new Error("Upload failed"));
                }
              };

              xhr.onerror = (error) => {
                form.setError("images", new Error("Upload error"));
                onError(file, error instanceof Error ? error : new Error("Upload failed"));
              };

              xhr.send(file);
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
    [form.clearErrors, append]
  );

  // Dialog state for selecting existing media
  const [_open, setOpen] = useQueryState("existing-media", parseAsBoolean);

  // Toggle function
  const toggleFeaturedImage = useCallback(
    (index: number) => {
      const images = form.getValues("images");
      if (Array.isArray(images)) {
        const isAlreadyFeatured = images[index]?.isPrimary;
        if (isAlreadyFeatured) return;
        const updatedImages = images.map((img, i) => ({
          ...img,
          isPrimary: i === index,
        }));
        form.setValue("images", updatedImages);
      }
    },
    [form]
  );

  // Memoized handleSelectMedia
  function handleSelectMedia(media: Media | Media[]) {
    const mediaArray = Array.isArray(media) ? media : [media];
    mediaArray.forEach((m) => {
      append({
        file: {
          name: m.fileName ?? undefined,
          url: m.url ?? undefined,
          size: m.fileSize ?? undefined,
        },
        metadata: {
          height: m.height ?? undefined,
          width: m.width ?? undefined,
          blurData: m.blurData ?? undefined,
        },
      });
    });
    setOpen(false);
    toast.success(`${mediaArray.length} image(s) selected from library`);
  }

  // Always get the latest images from the form state
  const watchedImages = form.watch("images") || [];

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="px-2 font-medium text-lg">Product Image Gallery</h2>
        <TabNavigation currentTab="media" />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {/* Upload Section */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Upload Images</CardTitle>
            <CardDescription>Upload new product images or select from existing media library.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name={"images"}
              render={() => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Upload Images</FormLabel>
                    <Button
                      className="text-muted-foreground text-xs"
                      onClick={() => setOpen(true)}
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
                      maxFiles={10}
                      maxSize={maxSize}
                      multiple
                      onFileReject={(_, message) => {
                        form.setError("images", {
                          message,
                        });
                      }}
                      onUpload={onUpload}
                      onValueChange={setFiles}
                      value={files}
                    >
                      <FileUploadDropzone className="relative flex select-none flex-col items-center justify-center gap-2 rounded-lg border-dashed py-12 outline-none transition-colors hover:bg-accent/30 focus-visible:border-ring/50 data-[disabled]:pointer-events-none data-[dragging]:border-primary data-[invalid]:border-destructive data-[dragging]:bg-accent/30 data-[invalid]:ring-destructive/20">
                        <div className="flex flex-col items-center gap-1 text-center">
                          <div className="flex items-center justify-center rounded-full border p-2.5">
                            <Upload className="size-6 text-muted-foreground" />
                          </div>
                          <p className="font-medium text-sm">Drag & drop image here</p>
                          <p className="text-muted-foreground text-xs">Or click to browse</p>
                          <FileUploadTrigger asChild>
                            <Button className="mt-2 w-fit" size="sm" variant="outline">
                              Browse files
                            </Button>
                          </FileUploadTrigger>
                        </div>
                      </FileUploadDropzone>

                      {/* Upload Progress Section */}
                      <div className="mt-4">
                        <div className="mb-2 flex items-center justify-between">
                          <h4 className="text-muted-foreground text-sm">
                            Uploading:{" "}
                            <span className="font-medium">
                              {files.length} {pluralize("File", files.length)}
                            </span>
                          </h4>
                          {files.length > 0 && (
                            <Button onClick={() => setFiles([])} size="sm" variant="outline">
                              Clear queue
                            </Button>
                          )}
                        </div>
                        <FileUploadList orientation="vertical">
                          {files.map((file, index) => (
                            <FileUploadItem key={index} value={file}>
                              <FileUploadItemPreview className="size-20 [&>svg]:size-12">
                                <FileUploadItemProgress size={30} variant="fill" />
                              </FileUploadItemPreview>
                              <FileUploadItemMetadata />

                              <FileUploadItemDelete asChild>
                                <Button className="size-5 rounded-full" size="icon" variant="secondary">
                                  <IconX className="size-3" />
                                </Button>
                              </FileUploadItemDelete>
                            </FileUploadItem>
                          ))}
                        </FileUploadList>
                      </div>
                    </FileUpload>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Uploaded Images Gallery */}
        {fields && fields.length > 0 && (
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Product Images Gallery</CardTitle>
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-muted-foreground text-sm">
                  Uploaded:{" "}
                  <span className="font-medium">
                    {fields.length} {pluralize("Image", fields.length)}
                  </span>
                </h4>
                {fields.length > 1 && (
                  <Button onClick={() => remove(fields.map((_, idx) => idx))} size="sm" variant="outline">
                    Remove all files
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <UploadedImagesList
                images={watchedImages.map((img) => ({
                  id: img.id,
                  file: {
                    url: img.file?.url,
                    name: img.file?.name || undefined,
                    size: img.file?.size || undefined,
                  },
                  metadata: img.metadata
                    ? {
                        width: img.metadata.width || undefined,
                        height: img.metadata.height || undefined,
                        blurData: img.metadata.blurData || undefined,
                      }
                    : undefined,
                  isPrimary: img.isPrimary,
                }))}
                onRemove={remove}
                onReorder={move}
                onToggleFeatured={toggleFeaturedImage}
              />
            </CardContent>
          </Card>
        )}
      </div>

      <MediaPickerModal multiple onSelect={handleSelectMedia} />
    </>
  );
}
