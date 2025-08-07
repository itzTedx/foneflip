import "./styles/index.css";

import type { Content, Editor as TiptapEditor } from "@tiptap/react";
import { EditorContent } from "@tiptap/react";

import { Separator } from "@ziron/ui/separator";
import { cn } from "@ziron/utils";

import { LinkBubbleMenu } from "./components/bubble-menu/link-bubble-menu";
import { MeasuredContainer } from "./components/measured-container";
import { SectionFive } from "./components/section/five";
import { SectionFour } from "./components/section/four";
import { SectionOne } from "./components/section/one";
import { SectionTwo } from "./components/section/two";
import type { UseMinimalTiptapEditorProps } from "./hooks/use-minimal-tiptap";
import { useMinimalTiptapEditor } from "./hooks/use-minimal-tiptap";

export interface MinimalTiptapProps extends Omit<UseMinimalTiptapEditorProps, "onUpdate"> {
  value?: Content;
  onChange?: (value: Content) => void;
  className?: string;
  editorContentClassName?: string;
}

const Toolbar = ({ editor }: { editor: TiptapEditor }) => (
  <div className="flex h-12 shrink-0 overflow-x-auto border-border border-b p-2">
    <div className="flex w-max items-center gap-px">
      <SectionOne activeLevels={[2, 3, 4, 5, 6]} editor={editor} />

      <Separator className="mx-1.5" orientation="vertical" />

      <SectionTwo
        activeActions={["bold", "italic", "underline", "strikethrough", "code", "clearFormatting"]}
        editor={editor}
        mainActionCount={3}
        size="sm"
      />

      <Separator className="mx-1.5" orientation="vertical" />

      <SectionFour activeActions={["orderedList", "bulletList"]} editor={editor} mainActionCount={0} />

      <Separator className="mx-1.5" orientation="vertical" />

      <SectionFive activeActions={["codeBlock", "blockquote", "horizontalRule"]} editor={editor} mainActionCount={0} />
    </div>
  </div>
);

export const Editor = ({ value, onChange, className, editorContentClassName, ...props }: MinimalTiptapProps) => {
  const editor = useMinimalTiptapEditor({
    value,
    onUpdate: onChange,
    ...props,
  });

  if (!editor) {
    return null;
  }

  return (
    <MeasuredContainer
      as="div"
      className={cn(
        "flex h-auto w-full flex-col rounded-md border border-input shadow-xs min-data-[orientation=vertical]:h-72",
        "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        className
      )}
      name="editor"
    >
      <Toolbar editor={editor} />
      <EditorContent className={cn("minimal-tiptap-editor", editorContentClassName)} editor={editor} />
      <LinkBubbleMenu editor={editor} />
    </MeasuredContainer>
  );
};

Editor.displayName = "Editor";

export default Editor;
