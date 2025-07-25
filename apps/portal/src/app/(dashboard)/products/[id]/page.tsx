import { MainWrapper } from "@/components/layout/main-wrapper";
import { ProductForm } from "@/features/products/components/product-form";

type Params = Promise<{ id: string }>;

export default async function ProductPage({ params }: { params: Params }) {
  const { id } = await params;
  const editMode = id !== "new";
  return (
    <MainWrapper>
      <ProductForm isEditMode={editMode} />
    </MainWrapper>
  );
}
