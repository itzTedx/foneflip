import { memo, useMemo } from "react";

import { IconBolt } from "@tabler/icons-react";

import { IconAed } from "@ziron/ui/assets/currency";
import { StatusBadge, StatusBadgeDot, StatusBadgeIcon } from "@ziron/ui/status-badge";

import { SimpleTooltip, TooltipBadge } from "@/components/ui/tooltip";

import { ProductQueryResult } from "../../types";

interface PriceDisplayProps {
  label: string;
  price?: string | number | null;
  priceRange?: { from?: number; to?: number } | null;
}

interface ProductBadgesProps {
  data: ProductQueryResult;
}

// Memoized currency icon component to avoid re-creating on each render
const CurrencyIcon = memo(() => <IconAed className="mr-0.5 size-3 fill-foreground" />);
CurrencyIcon.displayName = "CurrencyIcon";

// Optimized PriceDisplay component with proper memoization
export const PriceDisplay = memo<PriceDisplayProps>(({ label, price, priceRange }) => {
  // Memoize price content to avoid recalculation
  const priceContent = useMemo(() => {
    if (priceRange) {
      return (
        <>
          {priceRange.from}
          {priceRange.to && (
            <>
              {"\u{200B}"} - {"\u{200B}"}
              <CurrencyIcon />
              {priceRange.to}
            </>
          )}
        </>
      );
    }
    return price;
  }, [price, priceRange]);

  return (
    <div>
      <h3 className="text-muted-foreground text-xs">{label}</h3>
      <p className="flex items-center font-medium text-sm">
        <CurrencyIcon />
        {priceContent}
      </p>
    </div>
  );
});
PriceDisplay.displayName = "PriceDisplay";

// Optimized ProductBadges component with proper memoization and conditionals
export const ProductBadges = memo<ProductBadgesProps>(({ data }) => {
  // Memoize badge components to avoid recreating them
  const badges = useMemo(() => {
    const badgeElements = [];

    // Condition badge
    if (data.condition) {
      const { condition } = data;
      badgeElements.push(
        <SimpleTooltip className="z-10" key="condition" tooltip={`Condition: ${data.condition}`}>
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
        </SimpleTooltip>
      );
    }

    // Collection badge
    if (data.collection?.title) {
      badgeElements.push(
        <TooltipBadge
          className="z-10"
          key="collection"
          tooltip={`Collection: ${data.collection.title}`}
          variant="secondary"
        >
          {data.collection.title}
        </TooltipBadge>
      );
    }

    // Vendor badge
    if (data.vendor?.businessName) {
      badgeElements.push(
        <TooltipBadge key="vendor" tooltip={`Seller: ${data.vendor.businessName}`}>
          {data.vendor.businessName}
        </TooltipBadge>
      );
    }

    // Tags badge
    const tags = data.settings?.tags;
    if (tags && tags.length > 0) {
      badgeElements.push(
        <TooltipBadge className="z-10" key="tags" tooltip={tags.join(", ")} variant="secondary">
          +{tags.length}
        </TooltipBadge>
      );
    }

    // Express delivery badge
    if (data.delivery?.expressDelivery) {
      badgeElements.push(
        <SimpleTooltip className="z-10" key="express" tooltip="Express Delivery">
          <StatusBadge status="warn" variant="light">
            <StatusBadgeIcon as={IconBolt} className="!size-3" />
            Express
          </StatusBadge>
        </SimpleTooltip>
      );
    }

    return badgeElements;
  }, [
    data.condition,
    data.collection?.title,
    data.vendor?.businessName,
    data.settings?.tags,
    data.delivery?.expressDelivery,
  ]);

  // Early return if no badges to render
  if (badges.length === 0) {
    return null;
  }

  return <div className="flex flex-wrap items-center gap-2">{badges}</div>;
});
ProductBadges.displayName = "ProductBadges";
