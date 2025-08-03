"use client";

import * as React from "react";

import { Avatar as AvatarPrimitive } from "radix-ui";

import { cn } from "@ziron/utils";

/**
 * Renders a styled avatar container component.
 *
 * Wraps the Radix UI Avatar root element, applying default styling and a `data-slot="avatar"` attribute. Additional props and class names are supported for further customization.
 */
function Avatar({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      className={cn("relative flex size-9 shrink-0 overflow-hidden rounded-sm", className)}
      data-slot="avatar"
      {...props}
    />
  );
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      className={cn("aspect-square size-full rounded-sm", className)}
      data-slot="avatar-image"
      {...props}
    />
  );
}

/**
 * Renders a styled fallback element for an avatar when the image cannot be displayed.
 *
 * Applies default styling and a data attribute for identification. Additional props and class names are supported.
 */
function AvatarFallback({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      className={cn("flex size-full items-center justify-center rounded-sm bg-muted capitalize", className)}
      data-slot="avatar-fallback"
      {...props}
    />
  );
}

export { Avatar, AvatarFallback, AvatarImage };
