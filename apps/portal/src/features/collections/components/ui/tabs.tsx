import { useCallback } from "react";

import { IconSettingsFilled } from "@ziron/ui/assets/icons";
import { TabsList, TabsTrigger } from "@ziron/ui/components/tabs";

import { TabTriggerType } from "../../data/constants";

export type TabTrigger = {
  value: string;
  label: string;
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
  const handleSettingsClick = useCallback(() => {
    onSettingsClick?.();
  }, [onSettingsClick]);

  if (tabTriggers.length === 0 && !showSettings) return null;

  return (
    <div className="bg-background/80 px-6 pt-2 backdrop-blur-xl">
      <TabsList className="flex h-auto w-full justify-between gap-2 rounded-none border-b bg-transparent p-0">
        <div className="flex gap-2">
          {tabTriggers.map(({ value, label, Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className={tabTriggerClass}
              {...props}
            >
              <Icon />
              {label}
            </TabsTrigger>
          ))}
        </div>
        {showSettings && (
          <div>
            <TabsTrigger
              value="settings"
              className={tabTriggerClass}
              onClick={handleSettingsClick}
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
