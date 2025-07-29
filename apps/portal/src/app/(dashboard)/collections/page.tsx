import { MainWrapper } from "@/components/layout/main-wrapper";
import { PageHeader } from "@/components/layout/page-header";
import { AddButton } from "@/components/ui/action-buttons";
import { hasPermission } from "@/modules/auth/actions/data-access";
import { getCollections } from "@/modules/collections/actions/queries";
import { CollectionsContent } from "@/modules/collections/components/collections-content";
import { ExportCsvButton } from "@/modules/collections/components/export-csv-button";
import { Suspense } from "react";

/**
 * Renders the Collections page, verifying user permissions and displaying a list of collections with related actions.
 *
 * Checks if the user has permission to create, delete, and update collections, fetches the collections data, and displays the page with options to export or add collections.
 */
export default async function CollectionsPage() {
  await hasPermission({
    permissions: {
      collections: ["create", "delete", "update"],
    },
  });

  const collections = await getCollections();

  return (
    <MainWrapper>
      <PageHeader
        title="Collections"
        badge={`${collections.length} Collections`}
      >
        <ExportCsvButton />
        <AddButton title="Collection" href="/collections/new" />
      </PageHeader>
      <Suspense>
        <CollectionsContent collections={collections} />
      </Suspense>
    </MainWrapper>
  );
}
