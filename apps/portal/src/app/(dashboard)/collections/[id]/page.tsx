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

  function toFormMedia(media: any) {
    if (!media || !media.url) return undefined; // url is required
    return {
      url: media.url,
      fileName: media.fileName ?? undefined,
      fileSize: media.fileSize ?? undefined,
      alt: media.alt ?? undefined,
      width: media.width ?? undefined,
      height: media.height ?? undefined,
      blurData: media.blurData ?? undefined,
      // add other fields as needed
    };
  }

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
    banner: toFormMedia(
      collection.collectionMedia.find((c) => c.type === "banner")?.media,
    ),
    thumbnail: toFormMedia(
      collection.collectionMedia.find((c) => c.type === "thumbnail")?.media,
    ),
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
  console.log("initial data from the page", collection);

  return (
    <MainWrapper>
      <CollectionForm isEditMode={isEditMode} initialData={initialData} />
    </MainWrapper>
  );
}
