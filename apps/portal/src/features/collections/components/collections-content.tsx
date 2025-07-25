"use client";

import dynamic from "next/dynamic";

import { getCollections } from "../actions/queries";
import { CollectionsEmptyState } from "./empty-state";

const CollectionListSortable = dynamic(
  () =>
    import("@/features/collections/components/sortable-collections").then(
      (mod) => mod.CollectionListSortable,
    ),
  { ssr: false },
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
      {/* <div className="mb-2 grid grid-cols-5 gap-4">
          <h2 className="text-muted-foreground col-span-2 px-4 text-sm font-semibold">
            Details
          </h2>
          <h2 className="text-muted-foreground col-span-2 px-4 text-sm font-semibold">
            Linked Products
          </h2>
        </div> */}

      <CollectionListSortable collections={collections} />
    </div>
  );
}
