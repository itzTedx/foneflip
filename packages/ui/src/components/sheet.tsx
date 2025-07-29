"use client";

import type { VariantProps } from "class-variance-authority";
import type { HTMLMotionProps, Transition } from "motion/react";
import * as React from "react";
import { cva } from "class-variance-authority";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Dialog as SheetPrimitive } from "radix-ui";

import { cn } from "@ziron/utils";

type SheetContextType = {
  isOpen: boolean;
};

const SheetContext = React.createContext<SheetContextType | undefined>(
  undefined
);

const useSheet = (): SheetContextType => {
  const context = React.useContext(SheetContext);
  if (!context) {
    throw new Error("useSheet must be used within a Sheet");
  }
  return context;
};

type SheetProps = React.ComponentProps<typeof SheetPrimitive.Root>;

/**
 * Provides a controlled or uncontrolled Sheet component for displaying modal content, managing open state and context for descendant components.
 *
 * Synchronizes open state with controlled props and notifies via `onOpenChange` when the open state changes. Supplies the current open state to child components through context.
 */
function Sheet({ children, ...props }: SheetProps) {
  const [isOpen, setIsOpen] = React.useState(
    props?.open ?? props?.defaultOpen ?? false
  );

  React.useEffect(() => {
    if (props?.open !== undefined) setIsOpen(props.open);
  }, [props?.open]);

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      setIsOpen(open);
      props.onOpenChange?.(open);
    },
    [props]
  );

  return (
    <SheetContext.Provider value={{ isOpen }}>
      <SheetPrimitive.Root
        data-slot="sheet"
        {...props}
        onOpenChange={handleOpenChange}
      >
        {children}
      </SheetPrimitive.Root>
    </SheetContext.Provider>
  );
}

type SheetTriggerProps = React.ComponentProps<typeof SheetPrimitive.Trigger>;

function SheetTrigger(props: SheetTriggerProps) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

type SheetCloseProps = React.ComponentProps<typeof SheetPrimitive.Close>;

function SheetClose(props: SheetCloseProps) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

type SheetPortalProps = React.ComponentProps<typeof SheetPrimitive.Portal>;

function SheetPortal(props: SheetPortalProps) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

type SheetOverlayProps = React.ComponentProps<typeof SheetPrimitive.Overlay>;

/**
 * Renders the overlay background for the Sheet component with blur and opacity effects.
 *
 * Applies fixed positioning and styling to cover the viewport behind the sheet. Additional class names can be provided for further customization.
 */
function SheetOverlay({ className, ...props }: SheetOverlayProps) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "bg-background/20 fixed inset-0 z-50 backdrop-blur-xs",
        className
      )}
      {...props}
    />
  );
}

const sheetVariants = cva("bg-background fixed z-50 gap-4 shadow-lg", {
  variants: {
    side: {
      top: "inset-x-0 top-0 border-b",
      bottom: "inset-x-0 bottom-0 border-t",
      left: "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
      right:
        "inset-y-3 right-2 w-3/4 rounded-md border sm:max-w-sm md:max-w-md",
    },
  },
  defaultVariants: {
    side: "right",
  },
});

type SheetContentProps = React.ComponentProps<typeof SheetPrimitive.Content> &
  VariantProps<typeof sheetVariants> &
  HTMLMotionProps<"div"> & {
    transition?: Transition;
    overlay?: boolean;
  };

/**
 * Renders the animated content area of the sheet, sliding in from the specified side with optional overlay and close button.
 *
 * @param side - The edge of the viewport from which the sheet appears (`top`, `bottom`, `left`, or `right`)
 * @param transition - Animation transition settings for the sheet's entrance and exit
 * @param overlay - Whether to display a blurred, fading overlay behind the sheet
 * @param children - Content to display inside the sheet
 */
function SheetContent({
  side = "right",
  className,
  transition = { type: "spring", stiffness: 150, damping: 25 },
  overlay = true,
  children,
  ...props
}: SheetContentProps) {
  const { isOpen } = useSheet();

  return (
    <AnimatePresence>
      {isOpen && (
        <SheetPortal forceMount data-slot="sheet-portal">
          {overlay && (
            <SheetOverlay asChild forceMount>
              <motion.div
                key="sheet-overlay"
                data-slot="sheet-overlay"
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              />
            </SheetOverlay>
          )}
          <SheetPrimitive.Content asChild forceMount {...props}>
            <motion.div
              key="sheet-content"
              data-slot="sheet-content"
              initial={
                side === "right"
                  ? { x: "100%" }
                  : side === "left"
                    ? { x: "-100%" }
                    : side === "top"
                      ? { y: "-100%" }
                      : { y: "100%" }
              }
              animate={{ x: 0, y: 0 }}
              exit={
                side === "right"
                  ? { x: "100%" }
                  : side === "left"
                    ? { x: "-100%" }
                    : side === "top"
                      ? { y: "-100%" }
                      : { y: "100%" }
              }
              transition={transition}
              className={cn(
                sheetVariants({ side }),
                "flex flex-col",
                className
              )}
              {...props}
            >
              {children}
              <SheetPrimitive.Close
                data-slot="sheet-close"
                className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </SheetPrimitive.Close>
            </motion.div>
          </SheetPrimitive.Content>
        </SheetPortal>
      )}
    </AnimatePresence>
  );
}

type SheetHeaderProps = React.ComponentProps<"div">;

/**
 * Renders the header section of a sheet with vertical layout and spacing.
 *
 * Applies appropriate styling for header content and supports additional class names and props.
 */
function SheetHeader({ className, ...props }: SheetHeaderProps) {
  return (
    <div
      data-slot="sheet-header"
      className={cn(
        "flex flex-col space-y-2 text-center sm:text-left",
        className
      )}
      {...props}
    />
  );
}

type SheetFooterProps = React.ComponentProps<"div">;

/**
 * Renders the footer section of a sheet with responsive layout and spacing.
 *
 * Accepts additional class names and props for customization.
 */
function SheetFooter({ className, ...props }: SheetFooterProps) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn(
        "flex flex-col-reverse px-4 py-3 sm:flex-row sm:justify-end sm:space-x-2",
        className
      )}
      {...props}
    />
  );
}

type SheetTitleProps = React.ComponentProps<typeof SheetPrimitive.Title>;

function SheetTitle({ className, ...props }: SheetTitleProps) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-foreground text-lg font-semibold", className)}
      {...props}
    />
  );
}

type SheetDescriptionProps = React.ComponentProps<
  typeof SheetPrimitive.Description
>;

function SheetDescription({ className, ...props }: SheetDescriptionProps) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
  useSheet,
  type SheetCloseProps,
  type SheetContentProps,
  type SheetDescriptionProps,
  type SheetFooterProps,
  type SheetHeaderProps,
  type SheetOverlayProps,
  type SheetPortalProps,
  type SheetProps,
  type SheetTitleProps,
  type SheetTriggerProps,
};
