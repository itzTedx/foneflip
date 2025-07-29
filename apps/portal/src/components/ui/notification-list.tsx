import { useState } from "react";

import { IconCheck } from "@tabler/icons-react";
import { useAtomValue } from "jotai";
import { parseAsBoolean, useQueryState } from "nuqs";

import { IconExpandDiagonalDuo, IconExpandDuo, IconFileAlertFilled } from "@ziron/ui/assets/icons";
import { Button } from "@ziron/ui/button";
import { cn } from "@ziron/utils";

import { productErrorAtom } from "@/modules/products/atom";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./colapsible";

export const Console = () => {
  const [collapsibleOpen, setCollapsibleOpen] = useState(false);
  const validationErrors = useAtomValue(productErrorAtom);
  const [_, setIsOpen] = useQueryState("console", parseAsBoolean);

  return (
    <Collapsible
      className="group fixed right-2 bottom-2 z-999 w-60 rounded-sm border border-border/40 bg-popover/70 backdrop-blur-lg"
      onOpenChange={setCollapsibleOpen}
      open={collapsibleOpen}
    >
      <div className="flex items-center justify-between p-1">
        <CollapsibleTrigger asChild disabled={validationErrors.length === 0}>
          <button
            className={cn(
              "flex items-center gap-2 text-sm",
              validationErrors.length ? "cursor-pointer text-destructive" : "cursor-not-allowed"
            )}
          >
            {validationErrors.length ? <IconFileAlertFilled /> : <IconCheck className="size-4 text-muted-foreground" />}
            <span className={cn(validationErrors.length ? "" : "opacity-50")}>Console</span>
          </button>
        </CollapsibleTrigger>
        <div className="flex items-center gap-1 text-muted-foreground">
          <div className="hidden group-data-[state=open]:block">
            <Button
              className="size-6"
              disabled={validationErrors.length === 0}
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
          <CollapsibleTrigger asChild disabled={validationErrors.length === 0}>
            <Button className="size-6" size="btn" variant="ghost">
              <IconExpandDiagonalDuo />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>

      <CollapsibleContent className="space-y-2">
        {validationErrors.map((error, index) => (
          <div className="flex flex-col gap-1 p-3" key={index}>
            <div className="flex flex-row items-center justify-between gap-1">
              <span className="font-mono text-[10px] text-muted-foreground">CODE: {error.code}</span>
              <span className="font-mono text-[10px] text-destructive">
                {"origin" in error ? (error.origin as string) : "unknown"}
              </span>
            </div>
            <p className="font-medium text-destructive text-xs">{error.message}</p>
            <div className="font-mono text-[10px] text-muted-foreground">{error.path.join("/")}</div>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};
