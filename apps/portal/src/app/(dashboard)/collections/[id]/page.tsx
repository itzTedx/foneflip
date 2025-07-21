import { MainWrapper } from "@/components/layout/main-wrapper";
import { getCollectionById } from "@/features/collections/actions/queries";
import { CollectionForm } from "@/features/collections/components/collections-form";
import { CollectionQueryResult } from "@/features/collections/types";

import type { CollectionFormType } from "@ziron/validators";

type Params = Promise<{ id: string }>;

// Transform database collection to form type
function transformCollectionToFormType(
  collection: false | CollectionQueryResult,
): (CollectionFormType & { updatedAt: Date }) | null {
  if (!collection) return null;

  return {
    id: collection.id,
    title: collection.title,
    description: collection.description || "",
    label: collection.label || "",
    sortOrder: collection.sortOrder || 0,
    slug: collection.slug,
    meta: {
      title: collection.seo?.metaTitle || undefined,
      description: collection.seo?.metaDescription || undefined,
      keywords: collection.seo?.keywords || undefined,
    },
    settings: {
      ...collection.settings,
    },
    updatedAt: collection.updatedAt,
  };
}

export default async function CollectionPage({ params }: { params: Params }) {
  const { id } = await params;
  const isEditMode = id !== "new";

  const collection = id !== "new" && (await getCollectionById(id));
  const initialData = transformCollectionToFormType(collection);
  console.log("initial data from the page", initialData);

  return (
    <MainWrapper>
      <CollectionForm isEditMode={isEditMode} initialData={initialData} />
    </MainWrapper>
  );
}
