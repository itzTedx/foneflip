"use client";

import { IconAdjustmentsHorizontal, IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "next-themes";

import { SegmentedControl, SegmentedControlList, SegmentedControlTrigger } from "@ziron/ui/segmented-control";

/**
 * Renders a segmented control for switching between light, dark, and system themes.
 *
 * Allows users to select their preferred theme, updating the application's appearance accordingly.
 */
export function ThemeSwitcher() {
  const { setTheme, theme } = useTheme();
  return (
    <SegmentedControl defaultValue={theme}>
      <SegmentedControlList className="flex">
        <SegmentedControlTrigger onClick={() => setTheme("light")} value="light">
          <IconSun className="size-4 shrink-0" /> Light
        </SegmentedControlTrigger>
        <SegmentedControlTrigger onClick={() => setTheme("dark")} value="dark">
          <IconMoon className="size-4 shrink-0" /> Dark
        </SegmentedControlTrigger>
        <SegmentedControlTrigger onClick={() => setTheme("system")} value="system">
          <IconAdjustmentsHorizontal className="size-4 shrink-0" /> System
        </SegmentedControlTrigger>
      </SegmentedControlList>
    </SegmentedControl>
  );
}
