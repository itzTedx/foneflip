import * as React from "react";

import {
  IconBold,
  IconClearFormatting,
  IconDots,
  IconItalic,
  IconStrikethrough,
  IconUnderline,
} from "@tabler/icons-react";
import type { Editor } from "@tiptap/react";

import { toggleVariants } from "@ziron/ui/toggle";
import { VariantProps } from "@ziron/utils";

import type { FormatAction } from "../../types";
import { ToolbarSection } from "../toolbar-section";

type TextStyleAction = "bold" | "italic" | "underline" | "strikethrough" | "code" | "clearFormatting";

interface TextStyle extends FormatAction {
  value: TextStyleAction;
}

const formatActions: TextStyle[] = [
  {
    value: "bold",
    label: "Bold",
    icon: <IconBold className="size-5" />,
    action: (editor) => editor.chain().focus().toggleBold().run(),
    isActive: (editor) => editor.isActive("bold"),
    canExecute: (editor) => editor.can().chain().focus().toggleBold().run() && !editor.isActive("codeBlock"),
    shortcuts: ["mod", "B"],
  },
  {
    value: "italic",
    label: "Italic",
    icon: <IconItalic className="size-5" />,
    action: (editor) => editor.chain().focus().toggleItalic().run(),
    isActive: (editor) => editor.isActive("italic"),
    canExecute: (editor) => editor.can().chain().focus().toggleItalic().run() && !editor.isActive("codeBlock"),
    shortcuts: ["mod", "I"],
  },
  {
    value: "underline",
    label: "Underline",
    icon: <IconUnderline className="size-5" />,
    action: (editor) => editor.chain().focus().toggleUnderline().run(),
    isActive: (editor) => editor.isActive("underline"),
    canExecute: (editor) => editor.can().chain().focus().toggleUnderline().run() && !editor.isActive("codeBlock"),
    shortcuts: ["mod", "U"],
  },
  {
    value: "strikethrough",
    label: "Strikethrough",
    icon: <IconStrikethrough className="size-5" />,
    action: (editor) => editor.chain().focus().toggleStrike().run(),
    isActive: (editor) => editor.isActive("strike"),
    canExecute: (editor) => editor.can().chain().focus().toggleStrike().run() && !editor.isActive("codeBlock"),
    shortcuts: ["mod", "shift", "S"],
  },

  {
    value: "clearFormatting",
    label: "Clear formatting",
    icon: <IconClearFormatting className="size-5" />,
    action: (editor) => editor.chain().focus().unsetAllMarks().run(),
    isActive: () => false,
    canExecute: (editor) => editor.can().chain().focus().unsetAllMarks().run() && !editor.isActive("codeBlock"),
    shortcuts: ["mod", "\\"],
  },
];

interface SectionTwoProps extends VariantProps<typeof toggleVariants> {
  editor: Editor;
  activeActions?: TextStyleAction[];
  mainActionCount?: number;
}

export const SectionTwo: React.FC<SectionTwoProps> = ({
  editor,
  activeActions = formatActions.map((action) => action.value),
  mainActionCount = 2,
  size,
  variant,
}) => {
  return (
    <ToolbarSection
      actions={formatActions}
      activeActions={activeActions}
      dropdownClassName="w-8"
      dropdownIcon={<IconDots className="size-5" />}
      dropdownTooltip="More formatting"
      editor={editor}
      mainActionCount={mainActionCount}
      size={size}
      variant={variant}
    />
  );
};

SectionTwo.displayName = "SectionTwo";

export default SectionTwo;
