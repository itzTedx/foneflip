import { useCallback, useMemo } from "react";

import { useFormContext } from "@ziron/ui/form";
import { ProductFormType } from "@ziron/validators";

/**
 * Custom hook for managing sortable product images with optimized performance.
 *
 * Provides memoized handlers and data transformations to reduce re-renders
 * and improve drag-and-drop performance.
 */
export function useSortableImages(move?: (oldIndex: number, newIndex: number) => void) {
  const form = useFormContext<ProductFormType>();

  // Memoized images data
  const images = useMemo(() => {
    const formImages = form.watch("images") || [];
    return formImages.map((img, index) => ({
      id: img.id || String(index),
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
    }));
  }, [form.watch("images")]);

  // Optimized remove handler
  const handleRemove = useCallback(
    (index: number) => {
      const currentImages = form.getValues("images");
      if (Array.isArray(currentImages) && currentImages[index]) {
        form.setValue(
          "images",
          currentImages.filter((_, i) => i !== index)
        );
      }
    },
    [form]
  );

  // Optimized reorder handler
  const handleReorder = useCallback(
    (oldIndex: number, newIndex: number) => {
      if (move) {
        // Use the move function from useFieldArray if available
        move(oldIndex, newIndex);
      } else {
        // Fallback to manual reordering
        const currentImages = form.getValues("images");
        if (Array.isArray(currentImages) && currentImages.length > 0) {
          const item = currentImages[oldIndex];
          if (item) {
            const newImages = [...currentImages];
            newImages.splice(oldIndex, 1);
            newImages.splice(newIndex, 0, item);
            form.setValue("images", newImages);
          }
        }
      }
    },
    [form, move]
  );

  // Optimized toggle featured handler
  const handleToggleFeatured = useCallback(
    (index: number) => {
      const currentImages = form.getValues("images");
      if (Array.isArray(currentImages) && currentImages.length > 0) {
        const isAlreadyFeatured = currentImages[index]?.isPrimary;
        if (isAlreadyFeatured) return;

        const updatedImages = currentImages.map((img, i) => ({
          ...img,
          isPrimary: i === index,
        }));
        form.setValue("images", updatedImages);
      }
    },
    [form]
  );

  // Memoized sortable items for dnd-kit
  const sortableItems = useMemo(() => images.map((img) => img.id), [images]);

  return {
    images,
    sortableItems,
    handleRemove,
    handleReorder,
    handleToggleFeatured,
  };
}
