"use client";

import dynamic from "next/dynamic";

import { getCollections } from "../actions/queries";
import { CollectionsEmptyState } from "./empty-state";

const CollectionListSortable = dynamic(
  () =>
    import("@/modules/collections/components/sortable-collections").then(
      (mod) => mod.CollectionListSortable
    ),
  { ssr: false }
);

// Main collections content component
export function CollectionsContent({
  collections,
}: {
  collections: Awaited<ReturnType<typeof getCollections>>;
}) {
  if (collections.length === 0) {
    return <CollectionsEmptyState />;
  }

  return (
    <div className="px-4 py-2 sm:px-6">
      <CollectionListSortable collections={collections} />
    </div>
  );
}
