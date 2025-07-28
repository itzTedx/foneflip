import type { CollectionFormType, MediaFormType } from "@ziron/validators";
import { MainWrapper } from "@/components/layout/main-wrapper";
import { hasPermission } from "@/modules/auth/actions/data-access";
import { getCollectionById } from "@/modules/collections/actions/queries";
import { CollectionForm } from "@/modules/collections/components/collections-form";
import { CollectionQueryResult, Media } from "@/modules/collections/types";

type Params = Promise<{ id: string }>;

// Transform database collection to form type
function transformCollectionToFormType(
  collection: false | CollectionQueryResult
): (CollectionFormType & { updatedAt: Date }) | null {
  if (!collection) return null;

  function toFormMedia(media?: Media): MediaFormType | undefined {
    if (!media || !media.url) return undefined; // url is required
    return {
      file: {
        url: media.url,
        name: media.fileName ?? undefined,
        size: media.fileSize ?? undefined,
      },
      metadata: {
        width: media.width ?? undefined,
        height: media.height ?? undefined,
        blurData: media.blurData ?? undefined,
      },
      alt: media.alt ?? undefined,
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
      collection.collectionMedia.find((c) => c.type === "banner")?.media
    ),
    thumbnail: toFormMedia(
      collection.collectionMedia.find((c) => c.type === "thumbnail")?.media
    ),
    settings: {
      ...collection.settings,
    },
    updatedAt: collection.updatedAt,
  };
}

export default async function CollectionPage({ params }: { params: Params }) {
  await hasPermission({
    permissions: {
      collections: ["create", "delete", "update"],
    },
  });
  const { id } = await params;
  const isEditMode = id !== "new";

  const collection = id !== "new" && (await getCollectionById(id));
  const initialData = transformCollectionToFormType(collection);
  // console.log("initial data from the page", collection);

  return (
    <MainWrapper>
      <CollectionForm isEditMode={isEditMode} initialData={initialData} />
    </MainWrapper>
  );
}
