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
export function SortableImageItem({ f, i, remove, toggleFeaturedImage }: SortableImageItemProps) {
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
