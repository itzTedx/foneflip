"use client";

import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";

import { Button } from "@ziron/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@ziron/ui/dialog";

/**
 * Displays a block of markdown content with a fixed maximum height and an expandable dialog for overflowed content.
 *
 * Shows the provided `mainMarkdown` content in a container limited to 300px height. If the content overflows, a gradient overlay and a "Read More" button appear. Clicking "Read More" opens a dialog displaying the full `dialogMarkdown` content with the specified `dialogTitle`.
 *
 * @param mainMarkdown - The primary markdown content to display in the collapsed view.
 * @param dialogMarkdown - The full markdown content shown in the dialog when expanded.
 * @param dialogTitle - The title displayed in the dialog header.
 * @returns The rendered markdown content with conditional overflow handling and dialog expansion.
 */
export function MarkdownPartial({
  mainMarkdown,
  dialogMarkdown,
  dialogTitle,
}: {
  mainMarkdown: ReactNode;
  dialogMarkdown: ReactNode;
  dialogTitle: string;
}) {
  const [isOverflowing, setIsOverflowing] = useState(false);

  const markdownRef = useRef<HTMLDivElement>(null);
  function checkOverflow(node: HTMLDivElement) {
    setIsOverflowing(node.scrollHeight > node.clientHeight);
  }

  useEffect(() => {
    const controller = new AbortController();
    window.addEventListener(
      "resize",
      () => {
        if (markdownRef.current == null) return;
        checkOverflow(markdownRef.current);
      },
      { signal: controller.signal }
    );

    return () => {
      controller.abort();
    };
  }, []);

  useLayoutEffect(() => {
    if (markdownRef.current == null) return;
    checkOverflow(markdownRef.current);
  }, []);

  return (
    <>
      <div className="relative max-h-[300px] overflow-hidden" ref={markdownRef}>
        {mainMarkdown}
        {isOverflowing && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background to-15% to-transparent" />
        )}
      </div>

      {isOverflowing && (
        <Dialog>
          <DialogTrigger asChild>
            <Button className="-ml-3 underline" variant="ghost">
              Read More
            </Button>
          </DialogTrigger>
          <DialogContent className="flex max-h-[calc(100%-2rem)] flex-col overflow-hidden md:max-w-3xl lg:max-w-4xl">
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto">{dialogMarkdown}</div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
