"use client";

import { useCallback, useState } from "react";

import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { closestCenter, DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { parseAsBoolean, useQueryState } from "nuqs";
import { toast } from "sonner";

import { Button } from "@ziron/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ziron/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFieldArray,
  useFormContext,
} from "@ziron/ui/form";
import { cn, pluralize } from "@ziron/utils";
import { MediaFormType, ProductFormType } from "@ziron/validators";

import { TabNavigation } from "@/components/ui/tab-navigation";
import { Media } from "@/modules/collections/types";
import { MediaPickerModal } from "@/modules/media/components/media-picker";

import { ImagePreviewCard } from "./fields/image-preview-card";

type SortableImageItemProps = {
  f: MediaFormType;
  i: number;
  remove: (index: number) => void;
  toggleFeaturedImage: (index: number) => void;
};

/**
 * Renders a sortable product image item with drag-and-drop, featuring, and removal controls.
 *
 * Wraps a product image preview card with sortable behavior, applying drag styles and passing handlers for marking as featured and removing the image.
 */
function SortableImageItem({ f, i, remove, toggleFeaturedImage }: SortableImageItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: f.id ?? "" });
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
      className={cn(f.file?.url.search("blob:") === 0 ? "animate-pulse transition-all" : "", "space-y-2")}
    >
      <ImagePreviewCard
        dragListeners={listeners}
        media={f}
        onMarkFeatured={() => toggleFeaturedImage(i)}
        onRemove={() => remove(i)}
        showActions={true}
      />
    </div>
  );
}

/**
 * Renders the product image gallery section within a product form, providing upload, selection, preview, drag-and-drop reordering, featuring, and removal of images.
 *
 * Integrates with form state to manage a dynamic array of images, allowing users to upload new images, select from existing media, mark one image as featured, remove individual or all images, and reorder images via drag-and-drop. Displays image previews with metadata and provides a drag overlay during reordering.
 */
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
  const featuredStatus = fields.map((_, i) => form.getValues(`images.${i}.isPrimary`));

  // Find the active image for overlay
  const idx = fields.findIndex((f) => f.id === activeId);
  const activeImage = idx !== -1 ? watchedImages[idx] : undefined;

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="px-2 font-medium text-lg">Product Image Gallery</h2>
        <TabNavigation currentTab="media" />
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
            <CardDescription>Upload and manage product images including thumbnails and order.</CardDescription>
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
                  <Button onClick={() => remove(fields.map((_, idx) => idx))} size="sm" variant="outline">
                    Remove all files
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <DndContext
                collisionDetection={closestCenter}
                onDragCancel={onDragCancel}
                onDragEnd={onDragEnd}
                onDragStart={onDragStart}
                sensors={sensors}
              >
                <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                  <div className="grid gap-3">
                    {watchedImages.map((img, i) => (
                      <SortableImageItem
                        f={{
                          ...img,
                          id: img.id || String(i),
                        }}
                        i={i}
                        key={img.id || i}
                        remove={remove}
                        toggleFeaturedImage={toggleFeaturedImage}
                      />
                    ))}
                  </div>
                </SortableContext>
                <DragOverlay>
                  {activeImage ? <ImagePreviewCard media={activeImage} showActions={false} /> : null}
                </DragOverlay>
              </DndContext>
            </CardContent>
          </Card>
        )}
      </div>
      <MediaPickerModal multiple onSelect={handleSelectMedia} />
    </>
  );
}
