import * as React from "react";

import { IconCaretUpDown } from "@tabler/icons-react";
import type { Editor } from "@tiptap/react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@ziron/ui/dropdown-menu";
import { toggleVariants } from "@ziron/ui/toggle";
import { cn, VariantProps } from "@ziron/utils";

import type { FormatAction } from "../types";
import { getShortcutKey } from "../utils";
import { ShortcutKey } from "./shortcut-key";
import { ToolbarButton } from "./toolbar-button";

interface ToolbarSectionProps extends VariantProps<typeof toggleVariants> {
  editor: Editor;
  actions: FormatAction[];
  activeActions?: string[];
  mainActionCount?: number;
  dropdownIcon?: React.ReactNode;
  dropdownTooltip?: string;
  dropdownClassName?: string;
}

export const ToolbarSection: React.FC<ToolbarSectionProps> = ({
  editor,
  actions,
  activeActions = actions.map((action) => action.value),
  mainActionCount = 0,
  dropdownIcon,
  dropdownTooltip = "More options",
  dropdownClassName = "w-12",
  size,
  variant,
}) => {
  const { mainActions, dropdownActions } = React.useMemo(() => {
    const sortedActions = actions
      .filter((action) => activeActions.includes(action.value))
      .sort((a, b) => activeActions.indexOf(a.value) - activeActions.indexOf(b.value));

    return {
      mainActions: sortedActions.slice(0, mainActionCount),
      dropdownActions: sortedActions.slice(mainActionCount),
    };
  }, [actions, activeActions, mainActionCount]);

  const renderToolbarButton = React.useCallback(
    (action: FormatAction) => (
      <ToolbarButton
        aria-label={action.label}
        disabled={!action.canExecute(editor)}
        isActive={action.isActive(editor)}
        key={action.label}
        onClick={() => action.action(editor)}
        size={size}
        tooltip={`${action.label} ${action.shortcuts.map((s) => getShortcutKey(s).symbol).join(" ")}`}
        variant={variant}
      >
        {action.icon}
      </ToolbarButton>
    ),
    [editor, size, variant]
  );

  const renderDropdownMenuItem = React.useCallback(
    (action: FormatAction) => (
      <DropdownMenuItem
        aria-label={action.label}
        className={cn("flex flex-row items-center justify-between gap-4", {
          "bg-accent": action.isActive(editor),
        })}
        disabled={!action.canExecute(editor)}
        key={action.label}
        onClick={() => action.action(editor)}
      >
        <span className="grow">{action.label}</span>
        <ShortcutKey keys={action.shortcuts} />
      </DropdownMenuItem>
    ),
    [editor]
  );

  const isDropdownActive = dropdownActions.some((action) => action.isActive(editor));

  return (
    <>
      {mainActions.map(renderToolbarButton)}
      {dropdownActions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <ToolbarButton
              aria-label={dropdownTooltip}
              className={cn("gap-0", dropdownClassName)}
              isActive={isDropdownActive}
              size={size}
              tooltip={dropdownTooltip}
              variant={variant}
            >
              {dropdownIcon || <IconCaretUpDown className="size-5" />}
            </ToolbarButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-full">
            {dropdownActions.map(renderDropdownMenuItem)}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
};

export default ToolbarSection;
