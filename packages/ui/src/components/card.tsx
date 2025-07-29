import * as React from "react";

import { cn } from "@ziron/utils";

/**
 * Renders a styled card container with customizable class names and div props.
 *
 * The card serves as the main wrapper for card UI elements, applying background, text color, shadow, border, padding, and rounded corners.
 */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground shadow-foreground/5 flex flex-col gap-3 rounded-md border py-3 shadow-[0_1px_2px_0_inset]",
        className
      )}
      {...props}
    />
  );
}

/**
 * Renders the header section of a card with grid layout and optional action slot support.
 *
 * Applies styling for spacing, alignment, and responsive grid columns when a card action is present. Additional div props are supported.
 */
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-3",
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-medium", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-xs font-light", className)}
      {...props}
    />
  );
}

/**
 * Renders a container for card action elements, positioned in the top-right area of the card header.
 *
 * Additional props are spread onto the underlying div element.
 */
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-3", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-3 [.border-t]:pt-3", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};
