"use client";

import type { FileWithPreview } from "@/hooks/use-file-upload";
import { memo, useCallback } from "react";
import Image from "next/image";
import { TabNavigation } from "@/components/layout/tab-navigation";
import { getSignedURL } from "@/features/media/actions/mutations";
import { computeSHA256 } from "@/features/media/utils/compute-sha256";
import { formatBytes, useFileUpload } from "@/hooks/use-file-upload";
import { IconX } from "@tabler/icons-react";
import { AlertCircleIcon, ImageIcon, UploadIcon, XIcon } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useFormContext } from "react-hook-form";

import { authClient } from "@ziron/auth/client";
import { Button } from "@ziron/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ziron/ui/components/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@ziron/ui/components/form";
import { Input } from "@ziron/ui/components/input";
import { CollectionFormType } from "@ziron/validators";

// Reusable component for media upload and preview
function MediaUploadPreview({
  label,
  name,
  value,
  onRemove,
  form,
}: {
  label: string;
  name: "thumbnail" | "banner";

  value: CollectionFormType["thumbnail"] | null;
  onRemove: () => void;
  form: ReturnType<typeof useFormContext<CollectionFormType>>;
}) {
  // Dialog state for selecting existing media
  const [mediaDialog, setMediaDialog] = useQueryState(
    `${name}-media-dialog`,
    parseAsString.withDefault(""),
  );
  const maxSizeMB = 2;
  const maxSize = maxSizeMB * 1024 * 1024; // 2MB default
  const acceptedFileTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
  ];

  const handleFilesAdded = async (addedFiles: FileWithPreview[]) => {
    const { data: session } = await authClient.getSession();
    if (!session) return;

    if (addedFiles.length === 0) return;

    const file = addedFiles[0]?.file;
    if (file && file instanceof File) {
      try {
        const checksum = await computeSHA256(file);

        const signedUrl = await getSignedURL(file.type, file.size, checksum);
        if (signedUrl.error !== undefined) {
          form.setError("banner", new Error(signedUrl.message));
        }
        if (signedUrl.success) {
          const url = signedUrl.success.url;

          await fetch(url, {
            method: "PUT",
            body: file,
            headers: {
              "Content-Type": file.type,
              "Content-Language": file.size.toString(),
            },
          });
        }
      } catch (err) {
        console.error("[MediaUploadPreview] Upload exception:", err);
      }
    }
  };

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept: acceptedFileTypes.join(","),
    maxSize,
    onFilesAdded: handleFilesAdded,
  });
  const previewUrl = files[0]?.preview || null;
  const fileName = files[0]?.file.name || null;

  return (
    <Card>
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
          name={name}
          render={() => (
            <FormItem>
              <div className="-mb-3 flex items-center justify-between">
                <FormLabel>Upload {label}</FormLabel>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground text-xs"
                  onClick={() => setMediaDialog("1")}
                >
                  Choose from existing
                </Button>
              </div>
              <FormControl>
                <div className="flex flex-col gap-2">
                  <div className="relative">
                    {/* Drop area */}
                    <div
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      data-dragging={isDragging || undefined}
                      className="border-input data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors has-[input:focus]:ring-[3px]"
                    >
                      <input
                        {...getInputProps()}
                        className="sr-only"
                        aria-label="Upload image file"
                      />
                      {previewUrl ? (
                        <div className="absolute inset-0 flex items-center justify-center p-4">
                          <img
                            src={previewUrl}
                            alt={files[0]?.file?.name || "Uploaded image"}
                            className="mx-auto max-h-full rounded object-contain"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
                          <div
                            className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                            aria-hidden="true"
                          >
                            <ImageIcon className="size-4 opacity-60" />
                          </div>
                          <p className="mb-1.5 text-sm font-medium">
                            Drop your image here
                          </p>
                          <p className="text-muted-foreground text-xs">
                            SVG, PNG, JPG or GIF (max. {maxSizeMB}MB)
                          </p>
                          <Button
                            variant="outline"
                            className="mt-4"
                            type="button"
                            onClick={openFileDialog}
                          >
                            <UploadIcon
                              className="-ms-1 size-4 opacity-60"
                              aria-hidden="true"
                            />
                            Select image
                          </Button>
                        </div>
                      )}
                    </div>

                    {previewUrl && (
                      <div className="absolute top-4 right-4">
                        <button
                          type="button"
                          className="focus-visible:border-ring focus-visible:ring-ring/50 z-50 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]"
                          onClick={() =>
                            files[0]?.id && removeFile(files[0].id)
                          }
                          aria-label="Remove image"
                        >
                          <XIcon className="size-4" aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </div>

                  {errors.length > 0 && (
                    <div
                      className="text-destructive flex items-center gap-1 text-xs"
                      role="alert"
                    >
                      <AlertCircleIcon className="size-3 shrink-0" />
                      <span>{errors[0]}</span>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Media Picker Dialog */}
        {/* <MediaPickerModal
          open={!!mediaDialog}
          onOpenChange={() => setMediaDialog("")}
          onSelect={handleSelectMedia}
        /> */}
        {/* End Media Picker Dialog */}
        {value && (
          <FormField
            control={form.control}
            name={`${name}.alt` as `thumbnail.alt` | `banner.alt`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image Preview</FormLabel>
                <FormControl>
                  <div className="flex gap-4">
                    <div className="bg-muted relative aspect-square size-40 shrink-0 overflow-hidden rounded-lg border">
                      <Image
                        fill
                        src={value.url}
                        alt={value.fileName ?? ""}
                        className="h-full w-full object-cover"
                        placeholder={value.blurData ? "blur" : "empty"}
                        blurDataURL={value.blurData ?? undefined}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 size-5 rounded-full border backdrop-blur-xl"
                        onClick={onRemove}
                        aria-label={`Remove ${label}`}
                      >
                        <IconX className="size-3" />
                      </Button>
                    </div>
                    <div className="flex w-full flex-col justify-between py-4">
                      <div>
                        <p className="truncate text-sm">{value.fileName}</p>
                        <p className="text-muted-foreground mt-1 mb-4 shrink-0 text-xs">
                          Size:{" "}
                          <span className="font-medium">
                            {formatBytes(value.fileSize ?? 0)}
                          </span>
                        </p>
                      </div>
                      <div className="space-y-1">
                        <FormLabel>Alternative text</FormLabel>
                        <Input
                          {...field}
                          placeholder="Enter alt text for accessibility"
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
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
        />
        <MediaUploadPreview
          label="Banner"
          name="banner"
          value={banner}
          onRemove={handleRemoveBanner}
          form={form}
        />
      </div>
    </>
  );
});
