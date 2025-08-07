import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@ziron/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@ziron/ui/card";
import { formatDate, pluralize } from "@ziron/utils";

import { StatusBadge } from "@/components/ui/status-badge";

import { ProductQueryResult } from "../../types";
import { getPriceRange } from "../../utils";
import { PriceDisplay, ProductBadges } from "./card-ui";
import { ProductActions } from "./product-actions";

interface Props {
  data: ProductQueryResult;
  showAction?: boolean;
}

export const ProductCard = ({ data, showAction = true }: Props) => {
  // Memoize expensive calculations
  const sellingPriceRange = useMemo(() => getPriceRange(data?.variants ?? [], "sellingPrice"), [data?.variants]);
  const originalPriceRange = useMemo(() => getPriceRange(data?.variants ?? [], "originalPrice"), [data?.variants]);
  const totalStock = useMemo(
    () =>
      data?.hasVariant
        ? (data.variants?.reduce((sum, v) => sum + (typeof v.stock === "number" ? v.stock : 0), 0) ?? 0)
        : data?.stock,
    [data?.hasVariant, data?.variants, data?.stock]
  );

  return (
    <Card className="relative overflow-hidden transition-[border-color] duration-300 hover:border-primary/50">
      <Link className="absolute inset-0 z-1" href={`/products/${data.id}?title=${encodeURIComponent(data.title)}`} />

      <CardContent className="space-y-4 sm:space-y-6">
        <CardHeader className="relative flex justify-between px-0 pt-0">
          <div className="flex items-center gap-2">
            {data.images && (
              <div className="relative aspect-square size-14 overflow-hidden rounded-sm border bg-muted">
                <Image
                  alt={`${data.title} product image`}
                  blurDataURL={data.images[0]?.media.blurData ?? undefined}
                  className="object-cover"
                  fill
                  placeholder={data.images[0]?.media.blurData ? "blur" : "empty"}
                  src={data.images[0]?.media.url ?? "/images/product-placeholder.webp"}
                />
              </div>
            )}
            <div>
              <h2 className="line-clamp-1 font-medium text-lg" title={data.title}>
                {data.title}
              </h2>
              <div className="flex items-center gap-2">
                {data.sku && (
                  <>
                    <p className="whitespace-nowrap text-muted-foreground text-xs">
                      SKU: <span className="font-medium">{data.sku}</span>
                    </p>
                    <div className="size-1 rounded-full bg-muted-foreground/50" />
                  </>
                )}
                <StatusBadge status={data.settings?.status} />
              </div>
            </div>
          </div>
          {showAction && <ProductActions id={data.id} title={data.title} />}
        </CardHeader>
        <ProductBadges data={data} />
        <div className="mt-2 grid grid-cols-2 gap-3">
          {(data.sellingPrice || (data.hasVariant && sellingPriceRange)) && (
            <PriceDisplay
              label="Selling Price"
              price={data.sellingPrice}
              priceRange={data.hasVariant ? sellingPriceRange : undefined}
            />
          )}
          {(data.originalPrice || (data.hasVariant && originalPriceRange)) && (
            <PriceDisplay
              label="Retail"
              price={data.originalPrice}
              priceRange={data.hasVariant ? originalPriceRange : undefined}
            />
          )}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {typeof totalStock === "number" && (
            <Badge variant="outline">
              {totalStock} {pluralize("stock", totalStock)}
            </Badge>
          )}
          {data.variants && data.variants.length !== 0 && (
            <Badge variant="outline">Variants ({data.variants.length})</Badge>
          )}
        </div>
        <p className="font-light text-muted-foreground text-xs">
          {formatDate(data.createdAt, { includeTime: true, relative: true })}
        </p>
      </CardFooter>
    </Card>
  );
};
