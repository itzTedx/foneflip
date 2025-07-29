"use client";

import * as React from "react";

import { XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { cn } from "@ziron/utils";

/**
 * Provides the root container for a dialog, wrapping the Radix UI Dialog primitive.
 */
function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

/**
 * Renders a trigger element that opens the dialog when activated.
 *
 * Accepts all props supported by the underlying dialog trigger primitive.
 */
function DialogTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

/**
 * Renders dialog content in a React portal, enabling the dialog to appear outside the DOM hierarchy of its parent.
 */
function DialogPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

/**
 * Renders a button or element that closes the dialog when activated.
 *
 * Wraps the Radix UI DialogPrimitive.Close component and adds a data attribute for identification.
 */
function DialogClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

/**
 * Renders a full-screen overlay behind the dialog with fade and blur effects, applying animation classes based on the dialog's open or closed state.
 *
 * Accepts additional class names and props for customization.
 */
function DialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-999 bg-background/80 backdrop-blur-xs data-[state=closed]:animate-out data-[state=open]:animate-in",
        className
      )}
      data-slot="dialog-overlay"
      {...props}
    />
  );
}

/**
 * Renders the main dialog content centered on the screen with overlay, animations, and optional close button.
 *
 * @param showCloseButton - If true, displays a close button in the top-right corner (default: true)
 */
function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-9999 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] rounded-sm border bg-background shadow-lg duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in sm:max-w-lg",
          className
        )}
        data-slot="dialog-content"
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            className="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0"
            data-slot="dialog-close"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

/**
 * Renders a styled container for dialog header content.
 *
 * Applies a vertical flex layout with spacing and responsive text alignment for use at the top of a dialog.
 */
function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-1 text-center sm:text-left", className)}
      data-slot="dialog-header"
      {...props}
    />
  );
}

/**
 * Renders a dialog footer container with responsive layout for action buttons or footer content.
 *
 * Arranges children in a column-reverse layout on small screens and a row aligned to the end on larger screens.
 */
function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      data-slot="dialog-footer"
      {...props}
    />
  );
}

/**
 * Renders a flex row container for dialog content with spacing, border, and padding.
 *
 * Intended for structuring header or grouped elements within a dialog.
 */
function DialogContainer({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-row items-center gap-2 border-b p-3", className)} {...props} />;
}

/**
 * Renders a container for dialog content with vertical layout, spacing, and padding.
 *
 * Additional class names and div props can be provided for further customization.
 */
function DialogContentContainer({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-4 p-3", className)} {...props} />;
}

/**
 * Renders a styled container for displaying an icon within a dialog.
 *
 * The container is centered, has fixed dimensions, rounded corners, and a muted background.
 */
function DialogIcon({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted-foreground/20", className)}
      {...props}
    />
  );
}

/**
 * Renders the dialog's title with emphasized font styling.
 *
 * Accepts additional class names and props for customization.
 */
function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("font-semibold leading-none", className)}
      data-slot="dialog-title"
      {...props}
    />
  );
}

/**
 * Renders styled description text for a dialog, typically used to provide additional context below the dialog title.
 *
 * Accepts additional class names and props for customization.
 */
function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("font-light text-muted-foreground text-xs", className)}
      data-slot="dialog-description"
      {...props}
    />
  );
}

export {
  Dialog,
  DialogIcon,
  DialogClose,
  DialogContent,
  DialogContainer,
  DialogDescription,
  DialogContentContainer,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
