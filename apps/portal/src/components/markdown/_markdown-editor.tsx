"use client"

import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  headingsPlugin,
  InsertTable,
  InsertThematicBreak,
  listsPlugin,
  ListsToggle,
  markdownShortcutPlugin,
  MDXEditor,
  MDXEditorMethods,
  MDXEditorProps,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
} from "@mdxeditor/editor"
import "@mdxeditor/editor/style.css"
import { useIsDarkMode } from "@ziron/ui/hooks/use-dark-mode"
import { cn } from "@ziron/utils"
import { Ref } from "react"
import { markdownClassNames } from "./markdown-renderer"

export default function InternalMarkdownEditor({
  ref,
  className,
  ...props
}: MDXEditorProps & { ref?: Ref<MDXEditorMethods> }) {
  const isDarkMode = useIsDarkMode()

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
              <BlockTypeSelect  />
              <BoldItalicUnderlineToggles  />
              <ListsToggle />
              
              <InsertThematicBreak />
              <InsertTable />
            </div>
          ),
          
        }),
      ]}
    />
  )
}