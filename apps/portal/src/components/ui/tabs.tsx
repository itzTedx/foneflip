"use client";
import type { JSX, SVGProps } from "react";
import * as React from "react";
import { usePathname } from "next/navigation";

import { useQueryState } from "nuqs";
import { Tabs as TabsPrimitive } from "radix-ui";

import { IconSettingsFilled } from "@ziron/ui/assets/icons";
import { cn } from "@ziron/utils";

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

  const valueFromPath =
    pathname === "/search"
      ? "general"
      : pathname.split("/").filter(Boolean).pop();

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

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
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

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
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

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn("flex-1 outline-none", className)}
      data-slot="tabs-content"
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };

export type TabTrigger = {
  value: string;
  label: string;
};

export type TabTriggerType = {
  value: string;
  label: string;
  Icon?: (
    props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
  ) => JSX.Element;
};

export interface TabsTriggersProps
  extends Omit<React.ComponentProps<typeof TabsTrigger>, "value"> {
  tabTriggers: readonly TabTriggerType[];
  showSettings?: boolean;
  onSettingsClick?: () => void;
  children?: React.ReactNode;
}

const tabTriggerClass =
  "data-[state=active]:after:bg-primary relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none";

export function TabsTriggers({
  tabTriggers,
  showSettings = true,
  onSettingsClick,
  ...props
}: TabsTriggersProps) {
  const handleSettingsClick = React.useCallback(() => {
    onSettingsClick?.();
  }, [onSettingsClick]);

  if (tabTriggers.length === 0 && !showSettings) return null;

  return (
    <div className="bg-background/80 px-6 pt-2 backdrop-blur-xl">
      <TabsList className="flex h-auto w-full justify-between gap-2 rounded-none border-b bg-transparent p-0">
        <div className="flex gap-2">
          {tabTriggers.map(({ value, label, Icon }) => (
            <TabsTrigger
              className={tabTriggerClass}
              key={value}
              value={value}
              {...props}
            >
              {Icon && <Icon />}
              {label}
            </TabsTrigger>
          ))}
        </div>
        {showSettings && (
          <div>
            <TabsTrigger
              className={tabTriggerClass}
              onClick={handleSettingsClick}
              value="settings"
            >
              <IconSettingsFilled className="size-4" />
              Settings
            </TabsTrigger>
          </div>
        )}
      </TabsList>
    </div>
  );
}
