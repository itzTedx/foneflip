import * as React from "react";

import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { Slot as SlotPrimitive } from "radix-ui";

import { cn } from "@ziron/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-95 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "inset-shadow-[0_-2px_5px_0] inset-shadow-primary-background/30 border-background border-t bg-gradient-to-t from-primary to-primary/85 text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 dark:border-foreground/20",
        destructive:
          "border-background border-t bg-gradient-to-t from-destructive to-red-500/85 text-white shadow-2xl shadow-destructive/30 shadow-xs hover:bg-destructive/80 focus-visible:ring-destructive/20 dark:border-foreground/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "inset-shadow-[0_2px_4px_0] inset-shadow-secondary-foreground/5 bg-gradient-to-t from-secondary to-secondary/60 text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        btn: "size-10 rounded-sm sm:size-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

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

  return <Comp className={cn(buttonVariants({ variant, size, className }))} data-slot="button" {...props} />;
}

export { Button, buttonVariants };
