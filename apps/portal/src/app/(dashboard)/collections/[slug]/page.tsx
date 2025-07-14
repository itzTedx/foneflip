import { MainWrapper } from "@/components/layout/main-wrapper";
import { getCollectionBySlug } from "@/features/collections/actions/queries";
import { CollectionForm } from "@/features/collections/components/collections-form";

type Params = Promise<{ slug: string }>;

export default async function CollectionPage({ params }: { params: Params }) {
  const { slug } = await params;
  const isEditMode = slug !== "new";

  const collection = await getCollectionBySlug(slug);
  return (
    <MainWrapper>
      <CollectionForm isEditMode={isEditMode} initialData={collection} />
    </MainWrapper>
  );
}
