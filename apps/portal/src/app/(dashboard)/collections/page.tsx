import { Suspense } from "react";
import Link from "next/link";
import { MainWrapper } from "@/components/layout/main-wrapper";
import { PageHeader } from "@/components/layout/page-header";
import { canCollectionCreate } from "@/features/auth/actions/data-access";
import { getCollections } from "@/features/collections/actions/queries";
import { CollectionsContent } from "@/features/collections/components/collections-content";
import { ExportCsvButton } from "@/features/collections/components/export-csv-button";
import { IconPlus } from "@tabler/icons-react";

import { Button } from "@ziron/ui/components/button";

export default async function CollectionsPage() {
  await canCollectionCreate();

  const collections = await getCollections();

  return (
    <MainWrapper>
      <PageHeader
        title="Collections"
        badge={`${collections.length} Collections`}
      >
        <ExportCsvButton />
        <Button asChild>
          <Link href="/collections/new">
            <IconPlus />
            <span>
              Add <span className="sr-only md:not-sr-only">Collection</span>
            </span>
          </Link>
        </Button>
      </PageHeader>
      <Suspense>
        <CollectionsContent collections={collections} />
      </Suspense>
    </MainWrapper>
  );
}
