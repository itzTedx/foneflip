import { Metadata } from "next";

import { MainWrapper } from "@/components/layout/main-wrapper";
import { hasPermission } from "@/modules/auth/actions/data-access";
import { getCollectionById } from "@/modules/collections/actions/queries";
import { CollectionForm } from "@/modules/collections/components/collections-form";
import { transformCollectionToFormType } from "@/modules/collections/utils/helper";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;

  const collection = await getCollectionById(id);

  if (!collection && id === "new") {
    return {
      title: "Add New Collection - Foneflip",
    };
  }

  return {
    title: `Edit "${collection?.title}" - Collection | Foneflip`,
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

  const collection = await getCollectionById(id);
  const initialData = transformCollectionToFormType(collection);
  // console.log("initial data from the page", collection);

  return (
    <MainWrapper>
      <CollectionForm initialData={initialData} isEditMode={isEditMode} />
    </MainWrapper>
  );
}
