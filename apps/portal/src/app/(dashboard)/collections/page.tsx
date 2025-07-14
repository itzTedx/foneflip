import Link from "next/link";
import { MainWrapper } from "@/components/layout/main-wrapper";
import { PageHeader } from "@/components/layout/page-header";
import { getCollections } from "@/features/collections/actions/queries";
import { IconPlus } from "@tabler/icons-react";

import { IconEmpty } from "@ziron/ui/assets/empty";
import { Button } from "@ziron/ui/components/button";
import { Card, CardContent } from "@ziron/ui/components/card";

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
      <CollectionsContent collections={collections} />
    </MainWrapper>
  );
}

// Main collections content component
async function CollectionsContent({
  collections,
}: {
  collections: Awaited<ReturnType<typeof getCollections>>;
}) {
  if (collections.length === 0) {
    return <CollectionsEmptyState />;
  }

  return (
    <div className="p-6">
      <div className="mb-2 grid grid-cols-5 gap-4">
        <h2 className="text-muted-foreground col-span-2 px-4 text-sm font-semibold">
          Details
        </h2>
        <h2 className="text-muted-foreground col-span-2 px-4 text-sm font-semibold">
          Linked Products
        </h2>
      </div>
      {/* <CollectionListSortable collections={collections} /> */}
      <div className="grid grid-cols-3 gap-4">
        {collections.map((col) => (
          <Card key={col.id}>
            <CardContent>
              <Link href={`/collections/${col.id}`}>{col.title}</Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Empty state component
function CollectionsEmptyState() {
  return (
    <div className="grid min-h-[70svh] place-content-center text-center">
      <div className="mx-auto max-w-md space-y-6">
        <IconEmpty className="text-muted-foreground/50 mx-auto h-32 w-32" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">No collections yet</h3>
          <p className="text-muted-foreground">
            Get started by creating your first collection to organize your
            products and improve your store&apos;s navigation.
          </p>
        </div>
        <Button asChild className="mx-auto">
          <Link href="/collections/new">
            <IconPlus />
            Create Your First Collection
          </Link>
        </Button>
      </div>
    </div>
  );
}
