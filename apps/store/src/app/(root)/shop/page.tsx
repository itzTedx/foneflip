import Image from "next/image";
import Link from "next/link";

import { db } from "@ziron/db/server";
import { IconAed } from "@ziron/ui/assets/currency";
import { Card, CardContent, CardTitle } from "@ziron/ui/card";
import { StatusBadge, StatusBadgeDot } from "@ziron/ui/status-badge";
import { calculateDiscountPercentage } from "@ziron/utils";

export default async function ShopPage() {
  const products = await db.query.productsTable.findMany({
    with: {
      images: {
        with: {
          media: true,
        },
      },
      settings: true,
    },
    orderBy: (collections, { desc }) => [desc(collections.createdAt)],
  });

  return (
    <main className="relative flex gap-3 py-6">
      <aside className="sticky top-[16vh] h-fit w-28 px-6">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm">Filter </p>
        </div>
      </aside>
      <div className="container grid flex-1 grid-cols-3 gap-4">
        {products.map((product) => {
          const primaryImage = product.images.find((image) => image.isFeatured)?.media || product.images[0]?.media;
          const condition = product.condition;
          return (
            <Card key={product.id}>
              <Link className="absolute inset-0 z-1" href={`/shop/${product.slug}`} />

              <CardContent>
                {product.images.length > 0 && primaryImage && (
                  <div className="relative aspect-square overflow-hidden rounded-lg">
                    <Image alt={product.title} className="object-cover" fill src={primaryImage.url} />
                  </div>
                )}
                <div className="space-y-2 pt-2">
                  <CardTitle>{product.title}</CardTitle>

                  <StatusBadge
                    className="capitalize"
                    status={
                      condition === "new"
                        ? "success"
                        : condition === "pristine"
                          ? "info"
                          : condition === "excellent"
                            ? "warn"
                            : "disabled"
                    }
                  >
                    <StatusBadgeDot />
                    {condition}
                  </StatusBadge>

                  <div className="flex items-center gap-2">
                    <p className="flex items-center gap-1.5 font-medium">
                      <IconAed className="size-3" />
                      {product.sellingPrice}
                    </p>
                    {product.originalPrice && (
                      <p className="relative flex items-center gap-1 px-0.5 font-light text-muted-foreground">
                        <span className="absolute left-0 h-px w-full bg-muted-foreground" />
                        <IconAed className="size-3" />
                        {product.originalPrice}
                      </p>
                    )}
                    {product.originalPrice && product.sellingPrice && (
                      <p className="text-brand-secondary text-xs">
                        {calculateDiscountPercentage(product.originalPrice, product.sellingPrice)} off
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
