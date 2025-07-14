import { useCallback } from "react";
import { IconSettings } from "@tabler/icons-react";

import { TabsList, TabsTrigger } from "@ziron/ui/components/tabs";

export type TabTrigger = {
  value: string;
  label: string;
};

export interface TabsTriggersProps {
  tabTriggers: readonly TabTrigger[];
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
}: TabsTriggersProps) {
  const handleSettingsClick = useCallback(() => {
    onSettingsClick?.();
  }, [onSettingsClick]);

  if (tabTriggers.length === 0 && !showSettings) return null;

  return (
    <div className="bg-background/80 px-6 pt-2 backdrop-blur-xl">
      <TabsList className="flex h-auto w-full justify-between gap-2 rounded-none border-b bg-transparent p-0">
        <div className="flex gap-2">
          {tabTriggers.map(({ value, label }) => (
            <TabsTrigger key={value} value={value} className={tabTriggerClass}>
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
              <IconSettings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </div>
        )}
      </TabsList>
    </div>
  );
}
