import { getCollections } from "../actions/queries";
import { CollectionsEmptyState } from "./empty-state";
import { CollectionListSortable } from "./sortable-collections";

// Main collections content component
export function CollectionsContent({ collections }: { collections: Awaited<ReturnType<typeof getCollections>> }) {
  if (collections.length === 0) {
    return <CollectionsEmptyState />;
  }

  return (
    <div className="px-4 py-2 sm:px-6">
      <CollectionListSortable collections={collections} />
    </div>
  );
}
