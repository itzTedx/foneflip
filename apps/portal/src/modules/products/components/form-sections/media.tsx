"use client";

import Image from "next/image";
import { useState } from "react";

import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconGripVertical, IconStar, IconTrash } from "@tabler/icons-react";
import { parseAsString, useQueryState } from "nuqs";
import { toast } from "sonner";

import { IconButton } from "@/components/ui/icon-button";
import { TabNavigation } from "@/components/ui/tab-navigation";
import { TooltipBadge } from "@/components/ui/tooltip";
import { Media } from "@/modules/collections/types";
import { Button } from "@ziron/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ziron/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage, useFieldArray, useFormContext
} from "@ziron/ui/form";
import { cn, formatFileSize, pluralize } from "@ziron/utils";
import { ProductFormType } from "@ziron/validators";



type ProductImagePreviewCardProps = {
  url?: string;
  fileName?: string;
  fileSize?: number;
  width?: number;
  height?: number;
  onMarkFeatured?: () => void;
  onRemove?: () => void;
  onDrag?: () => void;
  isPrimary?: boolean;
  showActions?: boolean;
  dragListeners?: SyntheticListenerMap;
};

function ProductImagePreviewCard({
  url,
  fileName,
  fileSize,
  width,
  height,
  onMarkFeatured,
  onRemove,
  onDrag,
  isPrimary,
  showActions = false,
  dragListeners,
}: ProductImagePreviewCardProps) {
  return (
    <div className="bg-background flex items-center justify-between gap-2 rounded-lg border p-1.5 pe-3">
      <div className="flex items-center gap-2">
        <div className="bg-card relative aspect-square size-16 shrink-0 overflow-hidden rounded-sm border">
          <Image
            fill
            src={url ?? "/images/product-placeholder.webp"}
            alt={fileName ?? ""}
            quality={50}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="truncate text-xs font-medium">{fileName}</p>
          <div className="text-muted-foreground mt-0.5 flex items-center divide-x text-xs">
            <p className="pr-1">{formatFileSize(fileSize ?? 0)}</p>
            <p className="pl-1">
              {width} x {height}
            </p>
          </div>
        </div>
      </div>
      {showActions && (
        <div className="flex items-center gap-2">
          <TooltipBadge tooltip="Mark as featured" asChild>
            <IconButton
              size="sm"
              type="button"
              icon={IconStar}
              onClick={onMarkFeatured}
              active={isPrimary}
              aria-label={`Mark as featured`}
            />
          </TooltipBadge>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="text-muted-foreground/80 hover:text-foreground -me-2 size-8 hover:bg-transparent"
            onClick={onRemove}
            aria-label={`Remove ${fileName}`}
          >
            <IconTrash className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="btn"
            type="button"
            {...dragListeners}
            className="text-muted-foreground/60 ml-2 w-auto cursor-grab"
            style={{ touchAction: "none" }}
            aria-label="Drag to reorder"
            onClick={onDrag}
          >
            <IconGripVertical className="size-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

type SortableImageItemProps = {
  f: {
    id: string;
    url: string;
    fileName?: string;
    fileSize?: number;
    width?: number;
    height?: number;
    [key: string]: unknown;
  };
  i: number;
  isFeatured?: boolean;
  remove: (index: number) => void;
  toggleFeaturedImage: (index: number) => void;
};

function SortableImageItem({
  f,
  i,
  isFeatured,
  remove,
  toggleFeaturedImage,
}: SortableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: f.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        f.url.search("blob:") === 0 ? "animate-pulse transition-all" : "",
        "space-y-2"
      )}
    >
      <ProductImagePreviewCard
        url={f.url}
        fileName={f.fileName}
        fileSize={f.fileSize}
        width={f.width}
        height={f.height}
        onMarkFeatured={() => toggleFeaturedImage(i)}
        onRemove={() => remove(i)}
        isPrimary={isFeatured}
        showActions={true}
        dragListeners={listeners}
      />
    </div>
  );
}

type Metadata = {
  height?: number;
  width?: number;
  blurData?: string;
};

export function ProductMedia() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const form = useFormContext<ProductFormType>();

  const { fields, remove, append, move, replace } = useFieldArray({
    control: form.control,
    name: "images",
  });

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Dialog state for selecting existing media
  const [mediaDialog, setMediaDialog] = useQueryState(
    `media`,
    parseAsString.withDefault("")
  );

  // Toggle function
  function toggleFeaturedImage(index: number) {
    const images = form.getValues("images");
    if (Array.isArray(images)) {
      const isAlreadyFeatured = images[index]?.isPrimary;
      if (isAlreadyFeatured) return;
      images.forEach((_, i) => {
        form.setValue(`images.${i}.isPrimary`, i === index);
      });
    }
  }

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
        }
      });
    });
    setMediaDialog("");
    toast.success(`${mediaArray.length} image(s) selected from library`);
  }

  // Memoized onBeforeUploadBegin
//   function onBeforeUploadBegin(res: File[]) {
//     res.map((image) =>
//       append({
//         fileName: image.name,
//         fileSize: image.size,
//         url: URL.createObjectURL(image),
//       })
//     );
//     return res;
//   }

  // Memoized onClientUploadComplete
  type UploadThingResult = {
    name: string;
    size: number;
    key: string;
    ufsUrl: string;
    serverData?: unknown;
  };
//   function onClientUploadComplete(res: UploadThingResult[]) {
//     // Get the latest images from the form
//     const images = form.getValues("images") || [];
//     const updatedImages = images.map((img) => {
//       // If the url is a blob, try to find the uploaded image by fileName
//       if (img.url && img.url.startsWith("blob:")) {
//         const image = res.find((imgRes) => imgRes.name === img.fileName);
//         if (image) {
//           let metadata: Metadata | undefined = undefined;
//           if (
//             image.serverData &&
//             typeof image.serverData === "object" &&
//             "metadata" in image.serverData
//           ) {
//             metadata = (image.serverData as { metadata?: Metadata }).metadata;
//           }
//           return {
//             ...img,
//             url: image.ufsUrl,
//             fileName: image.name,
//             fileSize: image.size,
//             height: metadata?.height,
//             width: metadata?.width,
//             blurData: metadata?.blurData,
//             key: image.key,
//           };
//         }
//       }
//       return img;
//     });
//     replace(updatedImages);
//     toast.dismiss();
//     toast.success(`Images Uploaded`);
//   }

  // Memoized onUploadError
//   function onUploadError(error: Error) {
//     toast.error("Something went wrong while uploading image");
//     console.error(`ERROR! ${error.message}`);
//     form.setError("images", {
//       type: "validate",
//       message: error.message,
//     });
//     return;
//   }

  // Memoized onDragStart
  function onDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  // Memoized onDragEnd
  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (active.id !== over?.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over?.id);
      move(oldIndex, newIndex);
    }
  }

  // Memoized onDragCancel
  function onDragCancel() {
    setActiveId(null);
  }

  // Always get the latest images from the form state
  const watchedImages = form.watch("images") || [];

  // Featured status for each image
  const featuredStatus = fields.map((_, i) =>
    form.getValues(`images.${i}.isPrimary`)
  );

  // Find the active image for overlay
  const idx = fields.findIndex((f) => f.id === activeId);
  const activeImage = idx !== -1 ? watchedImages[idx] : undefined;

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="px-2 text-lg font-medium">Product Image Gallery</h2>
        <TabNavigation currentTab="media" />
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
            <CardDescription>
              Upload and manage product images including thumbnails and order.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name={"images"}
              render={() => (
                <FormItem>
                  <div className="-mb-3 flex items-center justify-between">
                    <FormLabel>Upload Images</FormLabel>
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
                    {/* <UploadDropzone
                      className="ut-allowed-content:text-muted-foreground ut-button:h-9 ut-button:w-32 ut-label:text-primary ut-upload-icon:text-primary/70 hover:bg-primary/5 ut-button:bg-primary ut-upload-icon:size-10 ut-label:mt-1 cursor-pointer border border-dashed transition-all duration-500 ease-in-out"
                      endpoint={"productImagesUploader"}
                      onBeforeUploadBegin={onBeforeUploadBegin}
                      onClientUploadComplete={onClientUploadComplete}
                      onUploadError={onUploadError}
                      config={{
                        mode: "auto",
                      }}
                    /> */}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        {/* TODO: Implement Global Media Picker Dialog */}
        {/* <MediaPickerModal
          open={!!mediaDialog}
          onOpenChange={() => setMediaDialog("")}
          onSelect={handleSelectMedia}
          multiple={true}
        /> */}
        {fields && fields.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Images Preview</CardTitle>
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-muted-foreground text-sm">
                  Uploaded:{" "}
                  <span className="font-medium">
                    {fields.length} {pluralize("Image", fields.length)}
                  </span>
                </h4>
                {fields.length > 1 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => remove(fields.map((_, idx) => idx))}
                  >
                    Remove all files
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDragCancel={onDragCancel}
              >
                <SortableContext
                  items={fields.map((f) => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="grid gap-3">
                    {watchedImages.map((img, i) => (
                      <SortableImageItem
                        key={img.id || i}
                        f={{ ...img, id: img.id || String(i), url: img.file?.url ?? "" }}
                        i={i}
                        isFeatured={featuredStatus[i]}
                        remove={remove}
                        toggleFeaturedImage={toggleFeaturedImage}
                      />
                    ))}
                  </div>
                </SortableContext>
                <DragOverlay>
                {activeImage ? (
                    <ProductImagePreviewCard
                      url={activeImage.file?.url}
                      fileName={activeImage.file?.name ?? ''}
                      fileSize={activeImage.file?.size ?? undefined}
                      width={activeImage.metadata?.width ?? undefined}
                      height={activeImage.metadata?.height ?? undefined}
                      showActions={false}
                    />
                  ) : null}
                </DragOverlay>
              </DndContext>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
