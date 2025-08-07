import * as React from "react";

import type { Editor } from "@tiptap/react";

import { IconBulletList, IconChevronUpDown, IconNumberList } from "@ziron/ui/assets/icons";
import { toggleVariants } from "@ziron/ui/toggle";
import { VariantProps } from "@ziron/utils";

import type { FormatAction } from "../../types";
import { ToolbarSection } from "../toolbar-section";

type ListItemAction = "orderedList" | "bulletList";
interface ListItem extends FormatAction {
  value: ListItemAction;
}

const formatActions: ListItem[] = [
  {
    value: "orderedList",
    label: "Numbered list",
    icon: (
      <svg fill="currentColor" height="20px" viewBox="0 -960 960 960" width="20px" xmlns="http://www.w3.org/2000/svg">
        <path d="M144-144v-48h96v-24h-48v-48h48v-24h-96v-48h120q10.2 0 17.1 6.9 6.9 6.9 6.9 17.1v48q0 10.2-6.9 17.1-6.9 6.9-17.1 6.9 10.2 0 17.1 6.9 6.9 6.9 6.9 17.1v48q0 10.2-6.9 17.1-6.9 6.9-17.1 6.9H144Zm0-240v-96q0-10.2 6.9-17.1 6.9-6.9 17.1-6.9h72v-24h-96v-48h120q10.2 0 17.1 6.9 6.9 6.9 6.9 17.1v72q0 10.2-6.9 17.1-6.9 6.9-17.1 6.9h-72v24h96v48H144Zm48-240v-144h-48v-48h96v192h-48Zm168 384v-72h456v72H360Zm0-204v-72h456v72H360Zm0-204v-72h456v72H360Z" />
      </svg>
    ),
    isActive: (editor) => editor.isActive("orderedList"),
    action: (editor) => editor.chain().focus().toggleOrderedList().run(),
    canExecute: (editor) => editor.can().chain().focus().toggleOrderedList().run(),
    shortcuts: ["mod", "shift", "7"],
  },
  {
    value: "bulletList",
    label: "Bullet list",
    icon: <IconBulletList className="size-4" />,
    isActive: (editor) => editor.isActive("bulletList"),
    action: (editor) => editor.chain().focus().toggleBulletList().run(),
    canExecute: (editor) => editor.can().chain().focus().toggleBulletList().run(),
    shortcuts: ["mod", "shift", "8"],
  },
];

interface SectionFourProps extends VariantProps<typeof toggleVariants> {
  editor: Editor;
  activeActions?: ListItemAction[];
  mainActionCount?: number;
}

export const SectionFour: React.FC<SectionFourProps> = ({
  editor,
  activeActions = formatActions.map((action) => action.value),
  mainActionCount = 0,
  size,
  variant,
}) => {
  // Determine which icon to show based on active state
  const getActiveIcon = () => {
    if (editor.isActive("orderedList")) {
      return <IconNumberList />;
    }
    if (editor.isActive("bulletList")) {
      return <IconBulletList className="size-4" />;
    }
    // Default icon when no list is active
    return <IconBulletList className="size-4" />;
  };

  return (
    <ToolbarSection
      actions={formatActions}
      activeActions={activeActions}
      dropdownIcon={
        <>
          {getActiveIcon()}
          <IconChevronUpDown className="ml-1 size-3 text-muted-foreground" />
        </>
      }
      dropdownTooltip="Lists"
      editor={editor}
      mainActionCount={mainActionCount}
      size={size}
      variant={variant}
    />
  );
};

SectionFour.displayName = "SectionFour";

export default SectionFour;
