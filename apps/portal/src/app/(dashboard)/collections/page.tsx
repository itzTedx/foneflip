import Link from "next/link";
import { MainWrapper } from "@/components/layout/main-wrapper";
import { PageHeader } from "@/components/layout/page-header";
import { getCollections } from "@/features/collections/actions/queries";
import { IconPlus } from "@tabler/icons-react";

import { Button } from "@ziron/ui/components/button";

export default async function CollectionsPage() {
  const collections = await getCollections();
  return (
    <MainWrapper>
      <PageHeader
        title="Collections"
        badge={`${collections.length} Collections`}
      >
        {/* <ExportCsvButton /> */}
        <Button asChild>
          <Link href="/collections/new">
            <IconPlus />
            Add Collection
          </Link>
        </Button>
      </PageHeader>
    </MainWrapper>
  );
}
