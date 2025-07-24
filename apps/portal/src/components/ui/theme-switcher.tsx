import {
  IconAdjustmentsHorizontal,
  IconMoon,
  IconSun,
} from "@tabler/icons-react";

import {
  SegmentedControl,
  SegmentedControlList,
  SegmentedControlTrigger,
} from "@ziron/ui/components/segmented-control";

export function ThemeSwitcher() {
  return (
    <SegmentedControl defaultValue="system">
      <SegmentedControlList
        className="flex w-fit items-center gap-2 rounded-full"
        floatingBgClassName="rounded-full bg-red-400"
      >
        <SegmentedControlTrigger value="light" className="aspect-square h-9">
          <IconSun className="size-6" />
        </SegmentedControlTrigger>
        <SegmentedControlTrigger value="dark" className="aspect-square h-9">
          <IconMoon className="size-6" />
        </SegmentedControlTrigger>
        <SegmentedControlTrigger value="system" className="aspect-square h-9">
          <IconAdjustmentsHorizontal className="size-6" />
        </SegmentedControlTrigger>
      </SegmentedControlList>
    </SegmentedControl>
  );
}
