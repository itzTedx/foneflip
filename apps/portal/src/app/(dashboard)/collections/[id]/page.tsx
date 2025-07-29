import type { CollectionFormType, MediaFormType } from "@ziron/validators";
import { MainWrapper } from "@/components/layout/main-wrapper";
import { hasPermission } from "@/modules/auth/actions/data-access";
import { getCollectionById } from "@/modules/collections/actions/queries";
import { CollectionForm } from "@/modules/collections/components/collections-form";
import { CollectionQueryResult, Media } from "@/modules/collections/types";

type Params = Promise<{ id: string }>;

/**
 * Converts a collection database object into a structure suitable for form initialization.
 *
 * Returns `null` if the input is `false`. Maps collection fields and associated media into the form type, including metadata and settings.
 *
 * @param collection - The collection object to transform, or `false` if not available
 * @returns The form-compatible collection data with `updatedAt`, or `null` if input is `false`
 */
function transformCollectionToFormType(
  collection: false | CollectionQueryResult
): (CollectionFormType & { updatedAt: Date }) | null {
  if (!collection) return null;

  /**
   * Converts a Media object to a MediaFormType suitable for form usage, or returns undefined if the media or its URL is missing.
   *
   * Maps media properties such as URL, file name, size, dimensions, blur data, and alt text to the form structure.
   *
   * @param media - The media object to convert
   * @returns The converted MediaFormType, or undefined if input is invalid
   */
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

/**
 * Renders the collection form page, handling both creation and editing modes based on the route parameter.
 *
 * Checks user permissions for collection management, fetches and transforms collection data if editing, and displays the form with appropriate initial values.
 */
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
