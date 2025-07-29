"use client";
import type { JSX, SVGProps } from "react";
import * as React from "react";
import { usePathname } from "next/navigation";

import { useQueryState } from "nuqs";
import { Tabs as TabsPrimitive } from "radix-ui";

import { IconSettingsFilled } from "@ziron/ui/assets/icons";
import { cn } from "@ziron/utils";

/**
 * Renders a tabbed interface with optional synchronization to the URL query parameter.
 *
 * If `query` is true (default), the selected tab is controlled via the "tab" query parameter in the URL, enabling deep linking and browser navigation support. Otherwise, the tab state is controlled by the `value` and `onValueChange` props or derived from the current pathname.
 *
 * @param query - If true, syncs the selected tab with the URL query parameter "tab"; otherwise, uses controlled or pathname-based tab selection.
 */
function Tabs({
  className,
  defaultValue,
  value,
  query = true,
  onValueChange,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root> & { query?: boolean }) {
  const [tabValue, setTabValue] = useQueryState("tab", {
    defaultValue: (defaultValue || value) as string,
    parse: (value) => value || "",
    serialize: (value) => value,
  });

  const pathname = usePathname();

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      setTabValue(newValue);
      onValueChange?.(newValue);
    },
    [setTabValue, onValueChange]
  );

  const valueFromPath = pathname === "/search" ? "general" : pathname.split("/").filter(Boolean).pop();

  return (
    <TabsPrimitive.Root
      className={cn("flex flex-col gap-2", className)}
      data-slot="tabs"
      defaultValue={query ? undefined : defaultValue}
      onValueChange={query ? handleValueChange : onValueChange}
      value={query ? tabValue : (value ?? valueFromPath)}
      {...props}
    />
  );
}

/**
 * Renders a styled container for tab triggers within the tabbed interface.
 *
 * Applies consistent layout and appearance to the list of tab triggers.
 */
function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex h-9 w-fit items-center justify-center rounded-lg bg-muted p-[3px] text-muted-foreground",
        className
      )}
      data-slot="tabs-list"
      {...props}
    />
  );
}

/**
 * Renders a styled tab trigger for use within a tabbed interface.
 *
 * Applies consistent styling and passes through additional props to the underlying Radix UI TabsPrimitive.Trigger component.
 */
function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex h-[calc(100%-1px)] flex-1 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-transparent px-2 py-1 font-medium text-foreground text-sm transition-[color,box-shadow] focus-visible:border-ring focus-visible:outline-1 focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:shadow-sm dark:text-muted-foreground dark:data-[state=active]:text-foreground [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-slot="tabs-trigger"
      {...props}
    />
  );
}

/**
 * Renders the content area for a tab, applying consistent layout and styling.
 *
 * Accepts all props supported by Radix UI's `TabsPrimitive.Content`.
 */
function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn("flex-1 outline-none", className)} data-slot="tabs-content" {...props} />;
}

export { Tabs, TabsContent, TabsList, TabsTrigger };

export type TabTrigger = {
  value: string;
  label: string;
};

export type TabTriggerType = {
  value: string;
  label: string;
  Icon?: (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => JSX.Element;
};

export interface TabsTriggersProps extends Omit<React.ComponentProps<typeof TabsTrigger>, "value"> {
  tabTriggers: readonly TabTriggerType[];
  showSettings?: boolean;
  onSettingsClick?: () => void;
  children?: React.ReactNode;
}

const tabTriggerClass =
  "data-[state=active]:after:bg-primary relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none";

/**
 * Renders a list of tab triggers and an optional settings tab for a tabbed interface.
 *
 * Displays each tab from the provided `tabTriggers` array, optionally including a settings tab that triggers a callback when clicked. Returns `null` if there are no tabs and the settings tab is disabled.
 *
 * @param tabTriggers - Array of tab definitions to render as triggers.
 * @param showSettings - Whether to display the settings tab (default: true).
 * @param onSettingsClick - Callback invoked when the settings tab is clicked.
 * @returns The rendered tab triggers and optional settings tab, or `null` if nothing should be displayed.
 */
export function TabsTriggers({ tabTriggers, showSettings = true, onSettingsClick, ...props }: TabsTriggersProps) {
  const handleSettingsClick = React.useCallback(() => {
    onSettingsClick?.();
  }, [onSettingsClick]);

  if (tabTriggers.length === 0 && !showSettings) return null;

  return (
    <div className="px-6 pt-1">
      <TabsList className="flex h-auto w-full justify-between gap-2 rounded-none border-b bg-transparent p-0">
        <div className="flex gap-2">
          {tabTriggers.map(({ value, label, Icon }) => (
            <TabsTrigger className={tabTriggerClass} key={value} value={value} {...props}>
              {Icon && <Icon />}
              {label}
            </TabsTrigger>
          ))}
        </div>
        {showSettings && (
          <div>
            <TabsTrigger className={tabTriggerClass} onClick={handleSettingsClick} value="settings">
              <IconSettingsFilled className="size-4" />
              Settings
            </TabsTrigger>
          </div>
        )}
      </TabsList>
    </div>
  );
}
