"use client";

import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  headingsPlugin,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  listsPlugin,
  MDXEditor,
  MDXEditorMethods,
  MDXEditorProps,
  markdownShortcutPlugin,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { useIsDarkMode } from "@ziron/ui/hooks/use-dark-mode";
import { cn } from "@ziron/utils";
import { Ref } from "react";

import { markdownClassNames } from "./markdown-renderer";

/**
 * Renders a markdown editor with a customized toolbar and plugin configuration.
 *
 * This component wraps the `MDXEditor` and provides a preconfigured set of plugins for headings, lists, quotes, tables, and markdown shortcuts. It applies markdown-specific styling and supports dark mode automatically.
 *
 * @returns The configured markdown editor component.
 */
export default function InternalMarkdownEditor({
  ref,
  className,
  ...props
}: MDXEditorProps & { ref?: Ref<MDXEditorMethods> }) {
  const isDarkMode = useIsDarkMode();

  return (
    <MDXEditor
      {...props}
      ref={ref}
      className={cn(markdownClassNames, isDarkMode && "dark-theme", className)}
      suppressHtmlProcessing
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        tablePlugin(),
        toolbarPlugin({
          toolbarContents: () => (
            <div className="flex items-center divide-x">
              <BlockTypeSelect />
              <BoldItalicUnderlineToggles />
              <ListsToggle />

              <InsertThematicBreak />
              <InsertTable />
            </div>
          ),
        }),
      ]}
    />
  );
}
