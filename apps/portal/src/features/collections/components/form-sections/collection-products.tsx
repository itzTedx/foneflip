import { memo } from "react";

import { IconEmpty } from "@/assets/empty";
import { ProductCard } from "@/features/products/components/product-card";
import { TabNavigation } from "@/features/products/components/tab-navigation";
import { ProductType } from "@/server/types";

interface Props {
  products?: ProductType[] | null;
}

export const CollectionProducts = memo(function CollectionProducts({
  products,
}: Props) {
  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="px-2 text-lg font-medium">Linked Products</h2>
        <TabNavigation currentTab="products" type="collections" />
      </div>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div key={product.id} className="cursor-pointer">
              <ProductCard data={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid place-content-center text-center">
          <IconEmpty />
          <p className="text-muted-foreground">No Products linked</p>
        </div>
      )}
    </>
  );
});
