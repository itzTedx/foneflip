import { MainWrapper } from "@/components/layout/main-wrapper";
import { hasPermission } from "@/features/auth/actions/data-access";
import { ProductForm } from "@/features/products/components/product-form";

type Params = Promise<{ id: string }>;

export default async function ProductPage({ params }: { params: Params }) {
 await hasPermission({
    permissions: {
      products: ["create", "delete", "update"]
    }
  });

  const { id } = await params;
  const editMode = id !== "new";
  return (
    <MainWrapper>
      <ProductForm isEditMode={editMode} />
    </MainWrapper>
  );
}
