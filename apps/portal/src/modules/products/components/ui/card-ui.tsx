import { IconBolt } from "@tabler/icons-react";

import { IconAed } from "@ziron/ui/assets/currency";

import { TooltipBadge } from "@/components/ui/tooltip";

import { ProductQueryResult } from "../../types";

export const PriceDisplay = ({
  label,
  price,
  priceRange,
}: {
  label: string;
  price?: string | number | null;
  priceRange?: { from?: number; to?: number } | null;
}) => (
  <div>
    <h3 className="text-muted-foreground text-xs">{label}</h3>
    <p className="flex items-center font-medium text-sm">
      <IconAed className="mr-0.5 size-3 fill-foreground" />
      {priceRange ? (
        <>
          {priceRange.from}
          {priceRange.to && (
            <>
              {"\u{200B}"} - {"\u{200B}"}
              <IconAed className="mr-0.5 size-3 fill-foreground" />
              {priceRange.to}
            </>
          )}
        </>
      ) : (
        price
      )}
    </p>
  </div>
);

export const ProductBadges = ({ data }: { data: ProductQueryResult }) => (
  <div className="flex flex-wrap items-center gap-2">
    {data.condition && <TooltipBadge tooltip={`Condition: ${data.condition}`}>{data.condition}</TooltipBadge>}
    {data.collection && (
      <TooltipBadge tooltip={`Collection: ${data.collection?.title}`} variant="secondary">
        {data.collection?.title}
      </TooltipBadge>
    )}
    {/* <TooltipBadge tooltip={`Seller: ${data?.vendor?.businessName}`}>
        
          {data?.vendor?.businessName}
       
      </TooltipBadge> */}
    {data.settings && data?.settings?.tags && data?.settings?.tags?.length > 0 && (
      <TooltipBadge tooltip={data.settings.tags.join(", ")} variant="secondary">
        +{data.settings.tags.length}
      </TooltipBadge>
    )}
    {data.delivery?.expressDelivery && (
      <TooltipBadge tooltip={"Express Delivery"} variant="warn">
        <IconBolt className="!size-2.5" />
        Express
      </TooltipBadge>
    )}
  </div>
);
