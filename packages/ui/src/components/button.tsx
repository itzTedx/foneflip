import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { cva } from "class-variance-authority";
import { Slot as SlotPrimitive } from "radix-ui";

import { cn } from "@ziron/utils";

const buttonVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "from-primary to-primary/85 border-background dark:border-foreground/20 shadow-primary/30 text-primary-foreground hover:bg-primary/90 inset-shadow-primary-background/30 border-t bg-gradient-to-t shadow-lg inset-shadow-[0_-2px_5px_0]",
        destructive:
          "from-destructive border-background dark:border-foreground/20 hover:bg-destructive/80 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 shadow-destructive/30 border-t bg-gradient-to-t to-red-500/85 text-white shadow-2xl shadow-xs",
        outline:
          "bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 border shadow-xs",
        secondary:
          "from-secondary to-secondary/60 text-secondary-foreground hover:bg-secondary/80 inset-shadow-secondary-foreground/10 bg-gradient-to-t shadow-xs inset-shadow-[0_2px_4px_0]",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        btn: "size-8 rounded-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

/**
 * Renders a customizable button with variant and size options, supporting both native button and slot rendering.
 *
 * If `asChild` is true, renders as a slot component for flexible composition; otherwise, renders a standard `<button>`. Styling is controlled via `variant` and `size` props, with additional classes merged from `className`.
 *
 * @param asChild - If true, renders as a slot component instead of a native button
 * @param variant - Visual style variant of the button
 * @param size - Size variant of the button
 */
function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? SlotPrimitive.Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
