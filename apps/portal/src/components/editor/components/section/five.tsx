import * as React from "react";

import { IconCaretUpDown, IconSeparator } from "@tabler/icons-react";
import type { Editor } from "@tiptap/react";
import { PlusIcon, QuoteIcon } from "lucide-react";

import { toggleVariants } from "@ziron/ui/toggle";
import { VariantProps } from "@ziron/utils";

import type { FormatAction } from "../../types";
import { LinkEditPopover } from "../link/link-edit-popover";
import { ToolbarSection } from "../toolbar-section";

type InsertElementAction = "codeBlock" | "blockquote" | "horizontalRule";
interface InsertElement extends FormatAction {
  value: InsertElementAction;
}

const formatActions: InsertElement[] = [
  {
    value: "blockquote",
    label: "Blockquote",
    icon: <QuoteIcon className="size-5" />,
    action: (editor) => editor.chain().focus().toggleBlockquote().run(),
    isActive: (editor) => editor.isActive("blockquote"),
    canExecute: (editor) => editor.can().chain().focus().toggleBlockquote().run(),
    shortcuts: ["mod", "shift", "B"],
  },
  {
    value: "horizontalRule",
    label: "Divider",
    icon: <IconSeparator className="size-5" />,
    action: (editor) => editor.chain().focus().setHorizontalRule().run(),
    isActive: () => false,
    canExecute: (editor) => editor.can().chain().focus().setHorizontalRule().run(),
    shortcuts: ["mod", "alt", "-"],
  },
];

interface SectionFiveProps extends VariantProps<typeof toggleVariants> {
  editor: Editor;
  activeActions?: InsertElementAction[];
  mainActionCount?: number;
}

export const SectionFive: React.FC<SectionFiveProps> = ({
  editor,
  activeActions = formatActions.map((action) => action.value),
  mainActionCount = 0,
  size,
  variant,
}) => {
  return (
    <>
      <LinkEditPopover editor={editor} size={size} variant={variant} />
      <ToolbarSection
        actions={formatActions}
        activeActions={activeActions}
        dropdownIcon={
          <>
            <PlusIcon className="size-5" />
            <IconCaretUpDown className="size-5" />
          </>
        }
        dropdownTooltip="Insert elements"
        editor={editor}
        mainActionCount={mainActionCount}
        size={size}
        variant={variant}
      />
    </>
  );
};

SectionFive.displayName = "SectionFive";

export default SectionFive;
