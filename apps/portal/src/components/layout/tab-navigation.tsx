import { collectionTabs } from "@/features/collections/data/constants";
import { IconChevronsLeft, IconChevronsRight } from "@tabler/icons-react";
import { useQueryState } from "nuqs";
import { useMemo } from "react";

import { Button } from "@ziron/ui/button";
import { cn } from "@ziron/utils";

const productTabs = [
  { value: "details", label: "General Info" },
  { value: "media", label: "Media" },
  { value: "seo", label: "SEO & Meta" },
  { value: "settings", label: "Settings" },
] as const;

interface Tab {
  value: string;
  label: string;
}

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
  const tabs: readonly Tab[] = useMemo(
    () => (type === "collections" ? collectionTabs : productTabs),
    [type],
  );
  const currentIdx: number = useMemo(
    () => tabs.findIndex((t) => t.value === currentTab),
    [tabs, currentTab],
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
          const prev = tabs[currentIdx - 1];
          if (!isFirst && prev && typeof prev.value === "string")
            setTab(prev.value);
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
          const next = tabs[currentIdx + 1];
          if (!isLast && next && typeof next.value === "string")
            setTab(next.value);
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
