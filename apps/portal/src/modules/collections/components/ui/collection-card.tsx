import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";

import { IconGripVertical, IconInfoCircle } from "@tabler/icons-react";

import { IconEmpty } from "@ziron/ui/assets/empty";
import { Badge } from "@ziron/ui/badge";
import { Button } from "@ziron/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@ziron/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@ziron/ui/hover-card";

import { StatusBadge } from "@/components/ui/status-badge";
import { TooltipBadge } from "@/components/ui/tooltip";
import { ProductQueryResult } from "@/modules/products/types";

import { CollectionQueryResult } from "../../types";
import { ActionDropdown } from "../action-dropdown";

/**
 * Converts an unknown status value to a valid collection status or null.
 *
 * @param status - The status value to normalize
 * @returns The status if it is "draft", "active", or "archived"; otherwise, null
 */
function normalizeStatus(status: unknown): "draft" | "active" | "archived" | null {
  if (status === "draft" || status === "active" || status === "archived") {
    return status as "draft" | "active" | "archived";
  }
  return null;
}

/**
 * Returns a product object with its collection property simplified to include only id, title, and slug, and all variant options cleared.
 *
 * @param product - The product to transform
 * @param collection - The collection to extract minimal shape from
 * @returns The product with a simplified collection and variants with empty options arrays
 */
function withCollectionShape(product: ProductQueryResult, collection: CollectionQueryResult): ProductQueryResult {
  return {
    ...product,
    collection: {
      id: collection?.id,
      title: collection?.title,
      slug: collection?.slug,
    },
    variants:
      product?.variants?.map((v) => ({
        ...v,
        options: [],
      })) ?? [],
  } as ProductQueryResult;
}

function ProductBadgeHover({
  product,
  collection,
}: {
  product: ProductQueryResult;
  collection: CollectionQueryResult;
}) {
  return (
    <HoverCard key={product?.id} openDelay={700}>
      <HoverCardTrigger>
        <Badge className="block max-w-[7rem] overflow-ellipsis font-light text-xs" variant="outline">
          {product?.title}
        </Badge>
      </HoverCardTrigger>
      <HoverCardContent className="min-w-xs border-0 p-0">
        {/* <ProductCard
          data={withCollectionShape(product, collection) as ProductQueryResult}
          showAction={false}
        /> */}
      </HoverCardContent>
    </HoverCard>
  );
}

// Props type alias
interface CollectionCardProps {
  collection: CollectionQueryResult;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  dragHandleRef?: React.Ref<HTMLButtonElement>;
}

const CollectionCard = React.memo(function CollectionCard({
  collection,
  dragHandleProps,
  dragHandleRef,
}: CollectionCardProps) {
  const thumbnail = useMemo(
    () => collection?.collectionMedia.find((t) => t.type === "thumbnail")?.media,
    [collection?.collectionMedia]
  );

  if (collection)
    return (
      <Card className="relative grid grid-cols-5 gap-4 hover:border-muted-foreground/50" key={collection?.id}>
        <Link
          className="absolute inset-0 z-0"
          href={`/collections/${collection.id}?title=${collection.title.replace(" ", "+")}`}
        />
        <CardHeader className="col-span-2 flex shrink-0 justify-between">
          <div className="flex gap-3">
            {thumbnail && (
              <div className="relative aspect-square size-24 shrink-0 overflow-hidden rounded-sm bg-muted">
                <Image
                  alt={thumbnail.alt ?? ""}
                  blurDataURL={thumbnail.blurData ?? ""}
                  className="h-full w-full object-cover"
                  height={100}
                  placeholder={thumbnail.blurData ? "blur" : "empty"}
                  quality={50}
                  src={thumbnail?.url}
                  width={100}
                />
              </div>
            )}
            <div className="py-1">
              <CardTitle className="flex items-center gap-2 font-medium text-lg">
                {collection.title}

                <StatusBadge status={collection.settings?.status} />
                {collection.label && <Badge>{collection.label}</Badge>}
                {collection.settings && collection.settings.showInNav === false && (
                  <TooltipBadge
                    tooltip="This collection is currently hidden in the storefront navigation bar."
                    variant="destructive"
                  >
                    <IconInfoCircle className="size-3" /> Hidden
                  </TooltipBadge>
                )}
              </CardTitle>
              <CardDescription className="line-clamp-3 text-sm">{collection.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="col-span-2 shrink-0">
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {collection.products?.length === 0 ? (
              <div>
                <IconEmpty className="grid size-12 w-full place-content-center" />
                <Badge className="font-light text-xs" variant="outline">
                  No linked products
                </Badge>
              </div>
            ) : (
              <>
                {collection.products?.slice(0, 4).map((product) => (
                  <ProductBadgeHover collection={collection} key={product?.id} product={product} />
                ))}
                {collection.products && collection.products.length > 4 && (
                  <Badge variant="outline">{collection.products.length - 4} +</Badge>
                )}
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className="z-10 gap-2 justify-self-end">
          <ActionDropdown
            id={collection.id ?? ""}
            status={normalizeStatus(collection.settings?.status)}
            title={collection.title}
          />
          <Button
            className="z-10 my-auto size-7 text-muted-foreground/60"
            ref={dragHandleRef}
            size={"icon"}
            variant={"ghost"}
            {...dragHandleProps}
          >
            <IconGripVertical />
          </Button>
        </CardFooter>
      </Card>
    );
});

export { CollectionCard };
