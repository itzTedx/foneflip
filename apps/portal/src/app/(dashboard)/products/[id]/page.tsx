import { MainWrapper } from "@/components/layout/main-wrapper";
import { hasPermission } from "@/modules/auth/actions/data-access";
import { getCollectionsMetadata } from "@/modules/collections/actions/queries";
import { ProductForm } from "@/modules/products/components/product-form";

type Params = Promise<{ id: string }>;

export default async function ProductPage({ params }: { params: Params }) {
 await hasPermission({
    permissions: {
      products: ["create", "delete", "update"]
    }
  });

  const collections = await getCollectionsMetadata()

  const { id } = await params;
  const editMode = id !== "new";
  return (
    <MainWrapper>
      {/* <pre>{JSON.stringify(collections, null, 2)}</pre> */}
      <ProductForm isEditMode={editMode} collections={collections}  />
    </MainWrapper>
  );
}
