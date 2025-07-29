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

/**
 * Renders navigation controls for switching between product or collection tabs.
 *
 * Displays "Previous" and "Next" buttons to navigate through a set of tabs, updating the "tab" query parameter in the URL. Buttons are disabled when at the first or last tab. Returns nothing if the current tab is not found.
 *
 * @param currentTab - The value of the currently active tab.
 * @param nextLabel - Accessible label for the "Next" button.
 * @param prevLabel - Accessible label for the "Previous" button.
 * @param className - Additional CSS classes for the container.
 * @param type - Specifies whether to use product or collection tabs.
 */
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
