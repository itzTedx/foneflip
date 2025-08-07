"use client";

import * as React from "react";

import { Separator as SeparatorPrimitive } from "radix-ui";

import { cn } from "@ziron/utils";

/**
 * Renders a styled separator line, either horizontal or vertical, for visually dividing content.
 *
 * Accepts all props of `SeparatorPrimitive.Root`. The `orientation` prop defaults to `"horizontal"`, and the separator is decorative by default.
 */
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      className={cn(
        "shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px",
        className
      )}
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      {...props}
    />
  );
}

export { Separator };
