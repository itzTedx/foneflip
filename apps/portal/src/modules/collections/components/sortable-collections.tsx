"use client";

import React, { useCallback, useMemo, useState } from "react";

import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { closestCenter, DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";

import { updateCollectionsOrder } from "../actions/mutations";
import { CollectionsQueryResult } from "../types";
import { CollectionCard as RawCollectionCard } from "./ui/collection-card";

const CollectionCard = React.memo(RawCollectionCard);

const SortableCollectionCard = React.memo(function SortableCollectionCard({
  collection,
}: {
  collection: CollectionsQueryResult[number];
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: collection?.id as string,
  });
  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.3 : 1,
      border: isDragging ? "1px solid var(--border)" : "none",
    }),
    [transform, transition, isDragging]
  );
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <CollectionCard collection={collection} dragHandleProps={listeners} dragHandleRef={setActivatorNodeRef} />
    </div>
  );
});

/**
 * Renders a sortable list of collection cards with drag-and-drop reordering.
 *
 * Allows users to reorder collections via drag-and-drop. Updates the backend with the new order and provides user feedback during the process.
 *
 * @param collections - The initial array of collections to display and sort
 */
export function CollectionListSortable({ collections: initialCollections }: { collections: CollectionsQueryResult }) {
  const [collections, setCollections] = useState(initialCollections);
  const sensors = useSensors(useSensor(PointerSensor));
  const [activeId, setActiveId] = useState<string | null>(null);

  // Memoize ids array
  const ids = useMemo(() => collections.map((c) => c?.id as string), [collections]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      if (active.id !== over?.id) {
        const oldIndex = collections.findIndex((c) => c?.id === active.id);
        const newIndex = collections.findIndex((c) => c?.id === over?.id);
        if (oldIndex === -1 || newIndex === -1) return;
        const newCollections = arrayMove(collections, oldIndex, newIndex);
        setCollections(newCollections);
        const toastId = toast.loading("Saving order...");
        // Prepare new order payload
        const orders = newCollections.map((c, idx) => ({
          id: c?.id as string,
          sortOrder: idx,
        }));
        await updateCollectionsOrder({ orders });
        toast.success("Order saved!", { id: toastId });
      }
    },
    [collections]
  );

  const activeCollection = useMemo(() => collections.find((c) => c?.id === activeId), [collections, activeId]);

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {collections.map((collection) => (
            <SortableCollectionCard collection={collection} key={collection?.id} />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>{activeCollection ? <CollectionCard collection={activeCollection} /> : null}</DragOverlay>
    </DndContext>
  );
}
