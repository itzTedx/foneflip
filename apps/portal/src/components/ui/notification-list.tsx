import { useState } from "react";

import { IconCheck, IconCode, IconInputX } from "@tabler/icons-react";
import { useAtomValue } from "jotai";
import { parseAsBoolean, useQueryState } from "nuqs";

import { IconEmpty } from "@ziron/ui/assets/empty";
import { IconExpandDiagonalDuo, IconExpandDuo, IconFileAlertFilled } from "@ziron/ui/assets/icons";
import { Button } from "@ziron/ui/button";
import { ScrollArea, ScrollBar } from "@ziron/ui/scroll-area";
import { cn } from "@ziron/utils";

import { productErrorAtom } from "@/modules/products/atom";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./colapsible";

export const Console = () => {
  const [collapsibleOpen, setCollapsibleOpen] = useState(false);
  const validationErrors = useAtomValue(productErrorAtom);
  const [_, setIsOpen] = useQueryState("console", parseAsBoolean);

  return (
    <Collapsible
      className={cn(
        "group fixed right-2 bottom-2 z-999 w-64 rounded-sm border bg-popover/70 backdrop-blur-lg",
        validationErrors.length ? "border-destructive/25" : "border-border/40"
      )}
      onOpenChange={setCollapsibleOpen}
      open={collapsibleOpen}
    >
      <div className="flex items-center justify-between p-1">
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-2 text-sm",
              validationErrors.length ? "cursor-pointer text-destructive" : "cursor-not-allowed"
            )}
          >
            {validationErrors.length ? <IconFileAlertFilled /> : <IconCheck className="size-4 text-muted-foreground" />}
            <span className={cn(validationErrors.length ? "" : "opacity-50")}>
              Console {validationErrors.length ? validationErrors.length : null}
            </span>
          </button>
        </CollapsibleTrigger>
        <div className="flex items-center gap-1 text-muted-foreground">
          <div className="hidden group-data-[state=open]:block">
            <Button
              className="size-6"
              onClick={() => {
                setCollapsibleOpen(false), setIsOpen(true);
              }}
              size="btn"
              variant="ghost"
            >
              <IconExpandDuo />
              <span className="sr-only">Toggle Full screen</span>
            </Button>
          </div>
          <CollapsibleTrigger asChild>
            <Button className="size-6" size="btn" variant="ghost">
              <IconExpandDiagonalDuo />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>

      <CollapsibleContent className="space-y-1 divide-y border-t">
        <ScrollArea className="max-h-[70svh]">
          {validationErrors.length > 0 ? (
            validationErrors.map((error, index) => (
              <div className="flex flex-col gap-1.5 p-3" key={index}>
                <div className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                  <div className="flex size-4 items-center justify-center rounded bg-destructive text-foreground">
                    <IconCode className="size-2.5" />
                  </div>
                  {error.code}
                </div>

                <div className="flex flex-wrap items-center gap-1">
                  <span className="rounded bg-muted/80 px-1 py-0.5 font-mono text-[10px] text-destructive">
                    {"origin" in error ? (error.origin as string) : "unknown"}
                  </span>
                  <p className="flex items-center gap-1 rounded bg-muted/80 px-1 py-0.5 font-mono text-[10px] text-muted-foreground">
                    <IconInputX className="size-3" /> {error.path.join("/")}
                  </p>
                </div>
                <div className="rounded-sm bg-muted/80 p-2">
                  <p className="font-medium text-muted-foreground text-xs">{error.message}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 p-3 text-muted-foreground">
              <IconEmpty className="size-40" />
              No logs yet
            </div>
          )}
          <ScrollBar />
        </ScrollArea>
      </CollapsibleContent>
    </Collapsible>
  );
};
