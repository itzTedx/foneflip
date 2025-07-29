"use client";

import { Button } from "@ziron/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ziron/ui/dialog";
import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";

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
      <div ref={markdownRef} className="max-h-[300px] overflow-hidden relative">
        {mainMarkdown}
        {isOverflowing && (
          <div className="bg-gradient-to-t from-background to-transparent to-15% inset-0 absolute pointer-events-none" />
        )}
      </div>

      {isOverflowing && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" className="underline -ml-3">
              Read More
            </Button>
          </DialogTrigger>
          <DialogContent className="md:max-w-3xl lg:max-w-4xl max-h-[calc(100%-2rem)] overflow-hidden flex flex-col">
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
