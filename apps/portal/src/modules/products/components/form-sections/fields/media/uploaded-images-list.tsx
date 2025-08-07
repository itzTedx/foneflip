"use client";

import { useState } from "react";

import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { closestCenter, DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
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

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Drag and drop handlers
  const onDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (active.id !== over?.id && onReorder) {
      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over?.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(oldIndex, newIndex);
      }
    }
  };

  const onDragCancel = () => {
    setActiveId(null);
  };

  // Find the active image for overlay
  const activeImage = activeId ? images.find((img) => img.id === activeId) : undefined;

  if (!showDragAndDrop) {
    return (
      <div className={cn("grid gap-3", className)}>
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
      collisionDetection={closestCenter}
      onDragCancel={onDragCancel}
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
      sensors={sensors}
    >
      <SortableContext
        items={images.map((img) => img.id || String(images.indexOf(img)))}
        strategy={verticalListSortingStrategy}
      >
        <div className={cn("grid gap-3", className)}>
          {images.map((image, index) => {
            // Convert to MediaFormType structure
            const mediaFormData: MediaFormType = {
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
            };

            return (
              <SortableImageItem
                f={mediaFormData}
                i={index}
                key={image.id || index}
                remove={onRemove}
                toggleFeaturedImage={onToggleFeatured}
              />
            );
          })}
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
