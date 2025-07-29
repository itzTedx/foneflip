import { useMemo } from "react";

import { IconChevronsLeft, IconChevronsRight } from "@tabler/icons-react";
import { useQueryState } from "nuqs";

import { COLLECTION_TABS } from "@/modules/collections/data/constants";
import { PRODUCTS_TABS } from "@/modules/products/data/constants";
import { Button } from "@ziron/ui/button";
import { cn } from "@ziron/utils";

interface TabNavigationProps {
  currentTab: string;
  nextLabel?: string;
  prevLabel?: string;
  className?: string;
  type?: "products" | "collections";
}

export function TabNavigation({
  currentTab,
  nextLabel = "Next",
  prevLabel = "Previous",
  className = "",
  type = "products",
}: TabNavigationProps) {
  const [, setTab] = useQueryState("tab");
  const tabs = useMemo(
    () => (type === "collections" ? COLLECTION_TABS : PRODUCTS_TABS),
    [type]
  );
  const currentIdx = useMemo(
    () => tabs.findIndex((t) => t.value === currentTab),
    [tabs, currentTab]
  );
  const isFirst = currentIdx <= 0;
  const isLast = currentIdx === tabs.length - 1 || currentIdx === -1;

  // If currentTab is invalid, don't render navigation
  if (currentIdx === -1) return null;

  return (
    <div className={cn(`flex gap-2`, className)}>
      <Button
        variant="outline"
        type="button"
        onClick={() => {
          if (!isFirst) setTab(tabs[currentIdx - 1]?.value ?? "");
        }}
        disabled={isFirst}
        aria-label={prevLabel}
      >
        <IconChevronsLeft />
        <span className="sr-only">{prevLabel}</span>
      </Button>
      <Button
        variant="outline"
        type="button"
        onClick={() => {
          if (!isLast) setTab(tabs[currentIdx + 1]?.value ?? "");
        }}
        disabled={isLast}
        aria-label={nextLabel}
      >
        <span className="sr-only">{nextLabel}</span>
        <IconChevronsRight />
      </Button>
    </div>
  );
}
