import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { TooltipBadge } from "@/components/ui/tooltip";
import { ProductQueryResult } from "@/features/products/types";
import { IconGripVertical, IconInfoCircle } from "@tabler/icons-react";

import { IconEmpty } from "@ziron/ui/assets/empty";
import { Badge } from "@ziron/ui/components/badge";
import { Button } from "@ziron/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@ziron/ui/components/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@ziron/ui/components/hover-card";

import { CollectionQueryResult } from "../../types";
import { ActionDropdown } from "../action-dropdown";

function normalizeStatus(
  status: unknown,
): "draft" | "active" | "archived" | null {
  if (status === "draft" || status === "active" || status === "archived") {
    return status as "draft" | "active" | "archived";
  }
  return null;
}

// Subcomponent for product badge with hover card
function withCollectionShape(
  product: ProductQueryResult,
  collection: CollectionQueryResult,
): ProductQueryResult {
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
        <Badge
          variant="outline"
          className="block max-w-[7rem] text-xs font-light overflow-ellipsis"
        >
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
    () =>
      collection?.collectionMedia.find((t) => t.type === "thumbnail")?.media,
    [collection?.collectionMedia],
  );

  if (collection)
    return (
      <Card
        className="hover:border-muted-foreground/50 relative grid grid-cols-5 gap-4"
        key={collection?.id}
      >
        <Link
          className="absolute inset-0 z-0"
          href={`/collections/${collection.id}?title=${collection.title.replace(" ", "+")}`}
        ></Link>
        <CardHeader className="col-span-2 flex shrink-0 justify-between">
          <div className="flex gap-3">
            {thumbnail && (
              <div className="bg-muted relative aspect-square size-24 shrink-0 overflow-hidden rounded-sm">
                <Image
                  src={thumbnail?.url}
                  alt={thumbnail.alt ?? ""}
                  width={100}
                  height={100}
                  quality={50}
                  className="h-full w-full object-cover"
                  placeholder={thumbnail.blurData ? "blur" : "empty"}
                  blurDataURL={thumbnail.blurData ?? ""}
                />
              </div>
            )}
            <div className="py-1">
              <CardTitle className="flex items-center gap-2 text-lg font-medium">
                {collection.title}
                <StatusBadge status={collection.settings?.status} />
                {collection.label && <Badge>{collection.label}</Badge>}
                {collection.settings &&
                  collection.settings.showInNav === false && (
                    <TooltipBadge
                      tooltip="This collection is currently hidden in the storefront navigation bar."
                      variant="destructive"
                    >
                      <IconInfoCircle className="size-3" /> Hidden
                    </TooltipBadge>
                  )}
              </CardTitle>
              <CardDescription className="line-clamp-3 text-sm">
                {collection.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="col-span-2 shrink-0">
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {collection.products?.length === 0 ? (
              <div>
                <IconEmpty className="grid size-12 w-full place-content-center" />
                <Badge variant="outline" className="text-xs font-light">
                  No linked products
                </Badge>
              </div>
            ) : (
              <>
                {collection.products?.slice(0, 4).map((product) => (
                  <ProductBadgeHover
                    key={product?.id}
                    product={product}
                    collection={collection}
                  />
                ))}
                {collection.products && collection.products.length > 4 && (
                  <Badge variant="outline">
                    {collection.products.length - 4} +
                  </Badge>
                )}
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className="z-10 gap-2 justify-self-end">
          <ActionDropdown
            title={collection.title}
            id={collection.id ?? ""}
            status={normalizeStatus(collection.settings?.status)}
          />
          <Button
            size={"icon"}
            variant={"ghost"}
            className="text-muted-foreground/60 z-10 my-auto size-7"
            ref={dragHandleRef}
            {...dragHandleProps}
          >
            <IconGripVertical />
          </Button>
        </CardFooter>
      </Card>
    );
});

export { CollectionCard };
