import { memo, useMemo } from "react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { cn } from "@ziron/utils";
import { MediaFormType } from "@ziron/validators";

import { ImagePreviewCard } from "./image-preview-card";

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
export const SortableImageItem = memo(function SortableImageItem({
  f,
  i,
  remove,
  toggleFeaturedImage,
}: SortableImageItemProps) {
  const sortableId = f.id ?? String(i);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sortableId,
  });

  // Memoized style object for better performance
  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 50 : 1,
      cursor: isDragging ? "grabbing" : "grab",
    }),
    [transform, transition, isDragging]
  );

  // Memoized className
  const className = useMemo(
    () =>
      cn(
        "space-y-2 transition-all duration-200",
        f.file?.url?.search("blob:") === 0 && "animate-pulse",
        isDragging && "scale-105 shadow-lg"
      ),
    [f.file?.url, isDragging]
  );

  // Memoized handlers to prevent unnecessary re-renders
  const handleMarkFeatured = useMemo(() => () => toggleFeaturedImage(i), [toggleFeaturedImage, i]);
  const handleRemove = useMemo(() => () => remove(i), [remove, i]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      aria-label={`Product image ${i + 1}`}
      className={className}
      role="listitem"
    >
      <ImagePreviewCard
        dragListeners={listeners}
        media={f}
        onMarkFeatured={handleMarkFeatured}
        onRemove={handleRemove}
        showActions={true}
      />
    </div>
  );
});
