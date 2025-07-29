"use client";

import {
  IconAdjustmentsHorizontal,
  IconMoon,
  IconSun,
} from "@tabler/icons-react";
import { useTheme } from "next-themes";

import {
  SegmentedControl,
  SegmentedControlList,
  SegmentedControlTrigger,
} from "@ziron/ui/segmented-control";

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
        <SegmentedControlTrigger
          value="light"
          onClick={() => setTheme("light")}
        >
          <IconSun className="size-4 shrink-0" /> Light
        </SegmentedControlTrigger>
        <SegmentedControlTrigger value="dark" onClick={() => setTheme("dark")}>
          <IconMoon className="size-4 shrink-0" /> Dark
        </SegmentedControlTrigger>
        <SegmentedControlTrigger
          value="system"
          onClick={() => setTheme("system")}
        >
          <IconAdjustmentsHorizontal className="size-4 shrink-0" /> System
        </SegmentedControlTrigger>
      </SegmentedControlList>
    </SegmentedControl>
  );
}
