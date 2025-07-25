import { MainWrapper } from "@/components/layout/main-wrapper";
import { PageHeader } from "@/components/layout/page-header";
import { AddButton } from "@/components/ui/action-buttons";
import { hasPermission } from "@/features/auth/actions/data-access";
import { getCollections } from "@/features/collections/actions/queries";
import { CollectionsContent } from "@/features/collections/components/collections-content";
import { ExportCsvButton } from "@/features/collections/components/export-csv-button";
import { Suspense } from "react";

export default async function CollectionsPage() {
  await hasPermission({
    permissions: {
      collections: ["create", "delete", "update"]
    }
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
