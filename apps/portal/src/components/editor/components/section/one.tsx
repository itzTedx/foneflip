import * as React from "react";

import { IconCaretUpDown, IconLetterCaseUpper } from "@tabler/icons-react";
import type { Editor } from "@tiptap/react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@ziron/ui/dropdown-menu";
import { toggleVariants } from "@ziron/ui/toggle";
import { cn, VariantProps } from "@ziron/utils";

import type { FormatAction } from "../../types";
import { ShortcutKey } from "../shortcut-key";
import { ToolbarButton } from "../toolbar-button";

type Level = 1 | 2 | 3 | 4 | 5 | 6;
interface TextStyle extends Omit<FormatAction, "value" | "icon" | "action" | "isActive" | "canExecute"> {
  element: keyof React.JSX.IntrinsicElements;
  level?: Level;
  className: string;
}

const formatActions: TextStyle[] = [
  {
    label: "Normal Text",
    element: "span",
    className: "grow",
    shortcuts: ["mod", "alt", "0"],
  },
  {
    label: "Heading 1",
    element: "h1",
    level: 1,
    className: "m-0 grow text-3xl font-extrabold",
    shortcuts: ["mod", "alt", "1"],
  },
  {
    label: "Heading 2",
    element: "h2",
    level: 2,
    className: "m-0 grow text-xl font-bold",
    shortcuts: ["mod", "alt", "2"],
  },
  {
    label: "Heading 3",
    element: "h3",
    level: 3,
    className: "m-0 grow text-lg font-semibold",
    shortcuts: ["mod", "alt", "3"],
  },
  {
    label: "Heading 4",
    element: "h4",
    level: 4,
    className: "m-0 grow text-base font-semibold",
    shortcuts: ["mod", "alt", "4"],
  },
  {
    label: "Heading 5",
    element: "h5",
    level: 5,
    className: "m-0 grow text-sm font-normal",
    shortcuts: ["mod", "alt", "5"],
  },
  {
    label: "Heading 6",
    element: "h6",
    level: 6,
    className: "m-0 grow text-sm font-normal",
    shortcuts: ["mod", "alt", "6"],
  },
];

interface SectionOneProps extends VariantProps<typeof toggleVariants> {
  editor: Editor;
  activeLevels?: Level[];
}

export const SectionOne: React.FC<SectionOneProps> = ({ editor, activeLevels = [1, 2, 3, 4, 5, 6], size, variant }) => {
  const filteredActions = React.useMemo(
    () => formatActions.filter((action) => !action.level || activeLevels.includes(action.level)),
    [activeLevels]
  );

  const handleStyleChange = React.useCallback(
    (level?: Level) => {
      if (level) {
        editor.chain().focus().toggleHeading({ level }).run();
      } else {
        editor.chain().focus().setParagraph().run();
      }
    },
    [editor]
  );

  const renderMenuItem = React.useCallback(
    ({ label, element: Element, level, className, shortcuts }: TextStyle) => (
      <DropdownMenuItem
        aria-label={label}
        className={cn("flex flex-row items-center justify-between gap-4", {
          "bg-accent": level ? editor.isActive("heading", { level }) : editor.isActive("paragraph"),
        })}
        key={label}
        onClick={() => handleStyleChange(level)}
      >
        <Element className={className}>{label}</Element>
        <ShortcutKey keys={shortcuts} />
      </DropdownMenuItem>
    ),
    [editor, handleStyleChange]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ToolbarButton
          aria-label="Text styles"
          className="gap-0"
          disabled={editor.isActive("codeBlock")}
          isActive={editor.isActive("heading")}
          pressed={editor.isActive("heading")}
          size={size}
          tooltip="Text styles"
          variant={variant}
        >
          <IconLetterCaseUpper className="size-5" />
          <IconCaretUpDown className="size-5" />
        </ToolbarButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-full">
        {filteredActions.map(renderMenuItem)}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

SectionOne.displayName = "SectionOne";

export default SectionOne;
