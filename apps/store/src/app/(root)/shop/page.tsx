import Image from "next/image";
import Link from "next/link";

import { db } from "@ziron/db/server";

export default async function ShopPage() {
  const categories = await db.query.collectionsTable.findMany({
    with: {
      collectionMedia: {
        with: {
          media: true,
        },
      },
      products: {
        with: {
          images: {
            with: {
              media: true,
            },
          },
        },
      },
      settings: true,
    },
    orderBy: (collections, { asc }) => [asc(collections.sortOrder)],
  });

  return (
    <main className="container mx-auto max-w-7xl space-y-12 py-12">
      {categories.map((category) => {
        const thumbnail = category.collectionMedia.find((t) => t.type === "thumbnail")?.media;
        const banner = category.collectionMedia.find((t) => t.type === "banner")?.media;
        return (
          <section className="grid grid-cols-3 gap-4" key={category.id}>
            <div>
              <h2>{category.title}</h2>
              {thumbnail && (
                <Image
                  alt={category.title}
                  height={thumbnail.height ?? 0}
                  src={thumbnail.url}
                  width={thumbnail.width ?? 0}
                />
              )}
            </div>
            <div className="col-span-2 grid grid-cols-3 gap-3">
              {category.products.map((product) => {
                const primaryImage = product.images.find((image) => image.isFeatured)?.media;
                return (
                  <Link href={`/shop/${category.slug}/${product.slug}`} key={product.id}>
                    {primaryImage && (
                      <Image
                        alt={product.title}
                        blurDataURL={primaryImage.blurData ?? ""}
                        height={primaryImage.height ?? 0}
                        placeholder={primaryImage.blurData ? "blur" : undefined}
                        src={primaryImage.url}
                        width={primaryImage.width ?? 0}
                      />
                    )}
                    <h3>{product.title}</h3>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </main>
  );
}
