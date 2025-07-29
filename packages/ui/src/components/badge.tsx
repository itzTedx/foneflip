import * as React from "react";

import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { Slot as SlotPrimitive } from "radix-ui";

import { cn } from "@ziron/utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-md border px-1.5 py-0.5 font-medium text-xs transition-[color,box-shadow] transition-color focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/10 text-primary-background hover:bg-primary/20 dark:bg-primary/30 dark:text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary-foreground/10",
        success:
          "border-green-200 bg-green-100 text-green-600 hover:bg-green-200/90 dark:border-green-900 dark:bg-green-950",
        destructive:
          "border-transparent bg-destructive/10 text-red-600 hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
        warn: "border-transparent bg-yellow-50 text-yellow-600 hover:bg-yellow-100 focus-visible:ring-yellow-100 dark:bg-yellow-900/60 dark:focus-visible:ring-yellow-600/40",
        outline: "text-foreground hover:bg-accent hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/**
 * Renders a stylized badge element with customizable appearance and optional component wrapping.
 *
 * The badge supports multiple visual variants and can render as a native `span` or wrap its child using a Slot primitive when `asChild` is true.
 *
 * @param variant - The visual style of the badge. Options include `default`, `secondary`, `success`, `destructive`, `warn`, and `outline`.
 * @param asChild - If true, renders the badge as a Slot to wrap its child component instead of a `span`.
 */
function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? SlotPrimitive.Slot : "span";

  return <Comp className={cn(badgeVariants({ variant }), className)} data-slot="badge" {...props} />;
}

export { Badge, badgeVariants, type VariantProps };
