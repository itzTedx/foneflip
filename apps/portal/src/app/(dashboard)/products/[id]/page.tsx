import { Metadata } from "next";

import { MainWrapper } from "@/components/layout/main-wrapper";
import { hasPermission } from "@/modules/auth/actions/data-access";
import { getCollectionsMetadata } from "@/modules/collections/actions/queries";
import { getProductById } from "@/modules/products/actions/queries";
import { ProductForm } from "@/modules/products/components/product-form";
import { transformProductToFormType } from "@/modules/products/utils/helper";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;

  const product = await getProductById(id);

  if (!product || id === "new") {
    return {
      title: "Add New Product - Foneflip",
    };
  }

  return {
    title: `Edit "${product.title}" - Product | Foneflip`,
  };
}

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

  const product = id !== "new" && (await getProductById(id));
  const initialData = transformProductToFormType(product);

  return (
    <MainWrapper>
      <ProductForm collections={collections} initialData={initialData} isEditMode={editMode} />
    </MainWrapper>
  );
}
