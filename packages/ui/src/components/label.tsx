"use client";

import { Label as LabelPrimitive } from "radix-ui";
import * as React from "react";

import { cn } from "@ziron/utils";

/**
 * Renders an accessible label component with consistent styling and disabled state handling.
 *
 * Combines default label styles with any additional class names and passes all other props to the underlying Radix UI LabelPrimitive.
 */
function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-1 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

/**
 * Renders a styled asterisk or custom content to indicate a required field or similar emphasis.
 *
 * Displays an asterisk by default, or custom children if provided. Applies styling for destructive color and disabled states.
 *
 * @param children - Optional content to display instead of the default asterisk
 */
function LabelAsterisk({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "text-destructive",
        // disabled
        "group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...rest}
    >
      {children || "*"}
    </span>
  );
}

export { Label, LabelAsterisk };
