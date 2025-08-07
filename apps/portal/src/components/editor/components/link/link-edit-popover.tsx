import * as React from "react";

import type { Editor } from "@tiptap/react";

import { IconLink } from "@ziron/ui/assets/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@ziron/ui/popover";
import type { toggleVariants } from "@ziron/ui/toggle";
import { VariantProps } from "@ziron/utils";

import { ToolbarButton } from "../toolbar-button";
import { LinkEditBlock } from "./link-edit-block";

interface LinkEditPopoverProps extends VariantProps<typeof toggleVariants> {
  editor: Editor;
}

const LinkEditPopover = ({ editor, size, variant }: LinkEditPopoverProps) => {
  const [open, setOpen] = React.useState(false);

  const { from, to } = editor.state.selection;
  const text = editor.state.doc.textBetween(from, to, " ");

  const onSetLink = React.useCallback(
    (url: string, text?: string, openInNewTab?: boolean) => {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .insertContent({
          type: "text",
          text: text || url,
          marks: [
            {
              type: "link",
              attrs: {
                href: url,
                target: openInNewTab ? "_blank" : "",
              },
            },
          ],
        })
        .setLink({ href: url })
        .run();

      editor.commands.enter();
    },
    [editor]
  );

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <ToolbarButton
          aria-label="Insert link"
          disabled={editor.isActive("codeBlock")}
          isActive={editor.isActive("link")}
          size={size}
          tooltip="Link"
          variant={variant}
        >
          <IconLink className="size-4" />
        </ToolbarButton>
      </PopoverTrigger>
      <PopoverContent align="end" className="p-0 py-1.5" side="bottom">
        <LinkEditBlock defaultText={text} onSave={onSetLink} />
      </PopoverContent>
    </Popover>
  );
};

export { LinkEditPopover };
