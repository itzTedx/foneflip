"use client";

import * as React from "react";

import { ScrollArea as ScrollAreaPrimitive } from "radix-ui";

import { cn } from "@ziron/utils";

/**
 * Provides a styled scrollable container with custom scrollbars and viewport, wrapping content for enhanced scrolling experience.
 *
 * Renders a scroll area with a customizable appearance, including a styled viewport, custom scrollbar, and corner element. All additional props are forwarded to the root element.
 *
 * @param className - Additional class names to apply to the scroll area root
 * @param children - Content to be rendered inside the scrollable viewport
 */
function ScrollArea({ className, children, ...props }: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
    <ScrollAreaPrimitive.Root className={cn("relative", className)} data-slot="scroll-area" {...props}>
      <ScrollAreaPrimitive.Viewport
        className="size-full rounded-[inherit] outline-none transition-[color,box-shadow] focus-visible:outline-1 focus-visible:ring-[3px] focus-visible:ring-ring/50"
        data-slot="scroll-area-viewport"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

/**
 * Renders a styled scrollbar for use within a scroll area, supporting vertical or horizontal orientation.
 *
 * @param orientation - The scrollbar's orientation; either "vertical" (default) or "horizontal"
 */
function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      className={cn(
        "flex touch-none select-none p-px transition-colors",
        orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent",
        className
      )}
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        className="relative flex-1 rounded-full bg-border"
        data-slot="scroll-area-thumb"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

export { ScrollArea, ScrollBar };
