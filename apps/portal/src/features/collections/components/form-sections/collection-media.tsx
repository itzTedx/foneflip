"use client";

import Image from "next/image";
import { memo, useCallback } from "react";

import { IconX } from "@tabler/icons-react";
import { parseAsString, useQueryState } from "nuqs";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { OurFileRouter } from "@/app/api/(core)/uploadthing/core";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Media,
  MediaPickerModal,
} from "@/features/media/components/media-picker-modal";
import { TabNavigation } from "@/features/products/components/tab-navigation";
import { UploadDropzone } from "@/lib/uploadthing";
import { formatFileSize } from "@/lib/utils";
import { MediaType } from "@/server/types";

import { CollectionFormType, collectionSchema } from "../../collection-schema";

// Reusable component for media upload and preview
function MediaUploadPreview({
  label,
  name,
  endpoint,
  value,
  onRemove,
  form,
}: {
  label: string;
  name: "thumbnail" | "banner";
  endpoint: keyof OurFileRouter;
  value: z.infer<typeof collectionSchema.shape.thumbnail> | MediaType | null;
  onRemove: () => void;
  form: ReturnType<typeof useFormContext<CollectionFormType>>;
}) {
  // Dialog state for selecting existing media
  const [mediaDialog, setMediaDialog] = useQueryState(
    `${name}MediaDialog`,
    parseAsString.withDefault("")
  );

  const handleSelectMedia = (media: Media | Media[]) => {
    const selected = Array.isArray(media) ? media[0] : media;
    if (!selected) return;
    form.setValue(`${name}.fileName`, selected.fileName ?? undefined);
    form.setValue(`${name}.url`, selected.url ?? undefined);
    form.setValue(`${name}.fileSize`, selected.fileSize ?? undefined);
    form.setValue(`${name}.height`, selected.height ?? undefined);
    form.setValue(`${name}.width`, selected.width ?? undefined);
    form.setValue(`${name}.blurData`, selected.blurData ?? undefined);
    setMediaDialog("");
    toast.success(`${label} selected from library`);
  };

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
                <UploadDropzone
                  endpoint={endpoint}
                  className="ut-allowed-content:text-muted-foreground ut-button:h-9 ut-button:w-32 ut-label:text-primary ut-upload-icon:text-primary/70 hover:bg-primary/5 ut-button:bg-primary ut-upload-icon:size-10 ut-label:mt-1 cursor-pointer border border-dashed transition-all duration-500 ease-in-out"
                  onClientUploadComplete={(res) => {
                    form.setValue(`${name}.fileName`, res[0].name);
                    form.setValue(`${name}.url`, res[0].ufsUrl);
                    form.setValue(`${name}.fileSize`, res[0].size);
                    toast.dismiss();
                    form.setValue(
                      `${name}.height`,
                      res[0].serverData?.metadata.height
                    );
                    form.setValue(
                      `${name}.width`,
                      res[0].serverData?.metadata.width
                    );
                    form.setValue(
                      `${name}.blurData`,
                      res[0].serverData?.metadata.blurData
                    );
                    toast.success(`${label} Uploaded`);
                  }}
                  onUploadError={(error: Error) => {
                    toast.error("Something went wrong while uploading image");
                    console.error(`ERROR! ${error.message}`);
                  }}
                  config={{
                    mode: "auto",
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Media Picker Dialog */}
        <MediaPickerModal
          open={!!mediaDialog}
          onOpenChange={() => setMediaDialog("")}
          onSelect={handleSelectMedia}
        />
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
                            {formatFileSize(value.fileSize ?? 0)}
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
          endpoint="thumbnailUploader"
          value={thumbnail}
          onRemove={handleRemoveThumbnail}
          form={form}
        />
        <MediaUploadPreview
          label="Banner"
          name="banner"
          endpoint="bannerUploader"
          value={banner}
          onRemove={handleRemoveBanner}
          form={form}
        />
      </div>
    </>
  );
});
