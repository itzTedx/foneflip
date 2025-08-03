import { Suspense } from "react";
import { Metadata } from "next";

import { MainWrapper } from "@/components/layout/main-wrapper";
import { PageHeader } from "@/components/layout/page-header";
import { AddButton } from "@/components/ui/action-buttons";
import { hasPermission } from "@/modules/auth/actions/data-access";
import { getCollections, getCollectionsCount } from "@/modules/collections/actions/queries";
import { CollectionsContent } from "@/modules/collections/components/collections-content";
import { ExportCsvButton } from "@/modules/collections/components/export-csv-button";

export const metadata: Metadata = {
  title: "Manage Collections | Foneflip",
  description: "Organize your products into collections.",
};

export default async function CollectionsPage() {
  await hasPermission({
    permissions: {
      collections: ["create", "delete", "update"],
    },
  });

  return (
    <MainWrapper>
      <Suspense
        fallback={
          <PageHeader badge={"Collections"} title="Collections">
            <ExportCsvButton />
            <AddButton href="/collections/new" title="Collection" />
          </PageHeader>
        }
      >
        <SuspendedCollectionsCount />
      </Suspense>
      <Suspense fallback={<div>Loading...</div>}>
        <SuspendedCollections />
      </Suspense>
    </MainWrapper>
  );
}

async function SuspendedCollections() {
  const collections = await getCollections();
  return <CollectionsContent collections={collections} />;
}

async function SuspendedCollectionsCount() {
  const count = await getCollectionsCount();
  return (
    <PageHeader badge={`${count} Collections`} title="Collections">
      <ExportCsvButton />
      <AddButton href="/collections/new" title="Collection" />
    </PageHeader>
  );
}
