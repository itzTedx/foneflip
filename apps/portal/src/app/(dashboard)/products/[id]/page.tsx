import { MainWrapper } from "@/components/layout/main-wrapper";
import { hasPermission } from "@/modules/auth/actions/data-access";
import { getCollectionsMetadata } from "@/modules/collections/actions/queries";
import { ProductForm } from "@/modules/products/components/product-form";

type Params = Promise<{ id: string }>;

/**
 * Renders the product page with a form for creating or editing a product, enforcing required permissions and loading collection metadata.
 *
 * @param params - A promise resolving to an object containing the product `id`
 * @returns The product page component wrapped in the main layout
 */
export default async function ProductPage({ params }: { params: Params }) {
  await hasPermission({
    permissions: {
      products: ["create", "delete", "update"],
    },
  });

  const collections = await getCollectionsMetadata();

  const { id } = await params;
  const editMode = id !== "new";
  return (
    <MainWrapper>
      {/* <pre>{JSON.stringify(collections, null, 2)}</pre> */}
      <ProductForm collections={collections} isEditMode={editMode} />
    </MainWrapper>
  );
}
