"use client";

import { useCallback, useMemo, useState } from "react";

import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { cn } from "@ziron/utils";
import { MediaFormType } from "@ziron/validators";

import { ImagePreviewCard } from "./image-preview-card";
import { SortableImageItem } from "./sortable-image";
import { UploadedImageItem } from "./uploaded-image-item";

interface UploadedImagesListProps {
  images: Array<{
    id?: string;
    file: {
      url?: string;
      name?: string;
      size?: number;
    };
    metadata?: {
      width?: number;
      height?: number;
      blurData?: string;
    };
    isPrimary?: boolean;
  }>;
  onRemove: (index: number) => void;
  onToggleFeatured: (index: number) => void;
  onReorder?: (oldIndex: number, newIndex: number) => void;
  className?: string;
  showDragAndDrop?: boolean;
}

export function UploadedImagesList({
  images,
  onRemove,
  onToggleFeatured,
  onReorder,
  className,
  showDragAndDrop = true,
}: UploadedImagesListProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Simplified sensors for better compatibility
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Memoized drag handlers for better performance
  const onDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (active.id !== over?.id && onReorder) {
        const oldIndex = images.findIndex((img) => img.id === active.id);
        const newIndex = images.findIndex((img) => img.id === over?.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          onReorder(oldIndex, newIndex);
        }
      }
    },
    [images, onReorder]
  );

  const onDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  // Memoized items array for SortableContext
  const sortableItems = useMemo(() => images.map((img) => img.id || String(images.indexOf(img))), [images]);

  // Memoized active image for overlay
  const activeImage = useMemo(
    () => (activeId ? images.find((img) => img.id === activeId) : undefined),
    [activeId, images]
  );

  // Memoized media form data conversion
  const getMediaFormData = useCallback(
    (image: (typeof images)[0], index: number): MediaFormType => ({
      id: image.id || String(index),
      file: image.file.url
        ? {
            url: image.file.url,
            name: image.file.name || null,
            size: image.file.size || null,
          }
        : undefined,
      metadata: image.metadata
        ? {
            width: image.metadata.width || null,
            height: image.metadata.height || null,
            blurData: image.metadata.blurData || null,
          }
        : undefined,
      isPrimary: image.isPrimary,
    }),
    []
  );

  // Non-drag-and-drop fallback
  if (!showDragAndDrop) {
    return (
      <div aria-label="Product images" className={cn("grid gap-3", className)} role="list">
        {images.map((image, index) => (
          <UploadedImageItem
            image={image}
            index={index}
            key={image.id || index}
            onRemove={onRemove}
            onToggleFeatured={onToggleFeatured}
          />
        ))}
      </div>
    );
  }

  return (
    <DndContext
      accessibility={{
        announcements: {
          onDragStart({ active }) {
            return `Picked up image ${active.id}`;
          },
          onDragOver({ active, over }) {
            if (over) {
              return `Image ${active.id} is over ${over.id}`;
            }
            return `Image ${active.id} is no longer over a droppable area`;
          },
          onDragEnd({ active, over }) {
            if (over) {
              return `Image ${active.id} was dropped over ${over.id}`;
            }
            return `Image ${active.id} was dropped`;
          },
          onDragCancel({ active }) {
            return `Dragging was cancelled. Image ${active.id} was dropped.`;
          },
        },
      }}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragCancel={onDragCancel}
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
      sensors={sensors}
    >
      <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
        <div aria-label="Sortable product images" className={cn("grid gap-3", className)} role="list">
          {images.map((image, index) => (
            <SortableImageItem
              f={getMediaFormData(image, index)}
              i={index}
              key={image.id || index}
              remove={onRemove}
              toggleFeaturedImage={onToggleFeatured}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeImage ? (
          <ImagePreviewCard
            media={{
              ...activeImage,
              file: activeImage.file.url
                ? {
                    ...activeImage.file,
                    url: activeImage.file.url,
                  }
                : undefined,
            }}
            showActions={false}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
