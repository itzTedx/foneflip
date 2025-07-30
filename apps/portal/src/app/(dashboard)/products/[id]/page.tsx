import { Metadata } from "next";

import { MainWrapper } from "@/components/layout/main-wrapper";
import { hasPermission } from "@/modules/auth/actions/data-access";
import { getCollectionsMetadata } from "@/modules/collections/actions/queries";
import { ProductForm } from "@/modules/products/components/product-form";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;

  // const product = await getProductBySlug(id);

  // if (!product || Array.isArray(product)) {
  //   return {
  //     title: "Add New Product - Foneflip",
  //   };
  // }

  if (id === "new") {
    return {
      title: "Add New Product - Foneflip",
    };
  }

  return {
    title: `Edit "${"product?.title"}" - Products | Foneflip`,
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
  return (
    <MainWrapper>
      <ProductForm collections={collections} isEditMode={editMode} />
    </MainWrapper>
  );
}
