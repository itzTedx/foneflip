// AlignUI StatusBadge v0.0.0

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import type { PolymorphicComponentProps, VariantProps } from "@ziron/utils";
import { recursiveCloneChildren, tv } from "@ziron/utils";

const STATUS_BADGE_ROOT_NAME = "StatusBadgeRoot";
const STATUS_BADGE_ICON_NAME = "StatusBadgeIcon";
const STATUS_BADGE_DOT_NAME = "StatusBadgeDot";

export const statusBadgeVariants = tv({
  slots: {
    root: [
      "inline-flex h-6 items-center justify-center gap-2 whitespace-nowrap rounded-md px-2 text-xs font-medium",
      "has-[>.dot]:gap-1.5",
    ],
    icon: "-mx-1 size-4",
    dot: [
      // base
      "dot -mx-1 flex size-4 items-center justify-center",
      // before
      "before:size-1.5 before:rounded-full before:bg-current",
    ],
  },
  variants: {
    variant: {
      stroke: {
        root: "bg-accent/30 text-muted-foreground ring-1 ring-inset ring-muted",
      },
      light: {},
    },
    status: {
      success: {
        icon: "text-success",
        dot: "text-success",
      },
      warn: {
        icon: "text-warn",
        dot: "text-warn",
      },
      error: {
        icon: "text-destructive",
        dot: "text-destructive",
      },
      disabled: {
        icon: "text-muted-foreground",
        dot: "text-muted-foreground",
      },
    },
  },
  compoundVariants: [
    {
      variant: "light",
      status: "success",
      class: {
        root: "bg-success-foreground/10 text-success",
      },
    },
    {
      variant: "light",
      status: "warn",
      class: {
        root: "bg-warn-foreground/10 text-warn",
      },
    },
    {
      variant: "light",
      status: "error",
      class: {
        root: "bg-destructive-foreground/10 text-destructive",
      },
    },
    {
      variant: "light",
      status: "disabled",
      class: {
        root: "bg-muted-foreground/10 text-muted-foreground",
      },
    },
  ],
  defaultVariants: {
    status: "disabled",
    variant: "stroke",
  },
});

type StatusBadgeSharedProps = VariantProps<typeof statusBadgeVariants>;

type StatusBadgeRootProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof statusBadgeVariants> & {
    asChild?: boolean;
  };

const StatusBadgeRoot = React.forwardRef<HTMLDivElement, StatusBadgeRootProps>(
  (
    { asChild, children, variant, status, className, ...rest },
    forwardedRef,
  ) => {
    const uniqueId = React.useId();
    const Component = asChild ? Slot : "div";
    const { root } = statusBadgeVariants({ variant, status });

    const sharedProps: StatusBadgeSharedProps = {
      variant,
      status,
    };

    const extendedChildren = recursiveCloneChildren(
      children as React.ReactElement[],
      sharedProps,
      [STATUS_BADGE_ICON_NAME, STATUS_BADGE_DOT_NAME],
      uniqueId,
      asChild,
    );

    return (
      <Component
        ref={forwardedRef}
        className={root({ class: className })}
        {...rest}
      >
        {extendedChildren}
      </Component>
    );
  },
);
StatusBadgeRoot.displayName = STATUS_BADGE_ROOT_NAME;

function StatusBadgeIcon<T extends React.ElementType = "div">({
  variant,
  status,
  className,
  as,
}: PolymorphicComponentProps<T, StatusBadgeSharedProps>) {
  const Component = as || "div";
  const { icon } = statusBadgeVariants({ variant, status });

  return <Component className={icon({ class: className })} />;
}
StatusBadgeIcon.displayName = STATUS_BADGE_ICON_NAME;

function StatusBadgeDot({
  variant,
  status,
  className,
  ...rest
}: StatusBadgeSharedProps & React.HTMLAttributes<HTMLDivElement>) {
  const { dot } = statusBadgeVariants({ variant, status });

  return <div className={dot({ class: className })} {...rest} />;
}
StatusBadgeDot.displayName = STATUS_BADGE_DOT_NAME;

export { StatusBadgeRoot as StatusBadge, StatusBadgeDot, StatusBadgeIcon };
