"use client";

import { Cropper as CropperPrimitive } from "./package/Cropper";

import { cn } from "@ziron/utils";

/**
 * A React component that provides a styled container for cropper functionality.
 *
 * Wraps the CropperPrimitive.Root component, applying default layout and interaction styles for cropping interfaces. Additional classes and props can be passed to customize appearance and behavior.
 */
function Cropper({
  className,
  ...props
}: React.ComponentProps<typeof CropperPrimitive.Root>) {
  return (
    <CropperPrimitive.Root
      data-slot="cropper"
      className={cn(
        "relative flex w-full cursor-move touch-none items-center justify-center overflow-hidden focus:outline-none",
        className
      )}
      {...props}
    />
  );
}

function CropperDescription({
  className,
  ...props
}: React.ComponentProps<typeof CropperPrimitive.Description>) {
  return (
    <CropperPrimitive.Description
      data-slot="cropper-description"
      className={cn("sr-only", className)}
      {...props}
    />
  );
}

/**
 * Renders an image within the cropper, applying object-cover styling and disabling pointer events.
 *
 * Combines default image styles with any additional classes and passes through all props to the underlying primitive.
 */
function CropperImage({
  className,
  ...props
}: React.ComponentProps<typeof CropperPrimitive.Image>) {
  return (
    <CropperPrimitive.Image
      data-slot="cropper-image"
      className={cn(
        "pointer-events-none h-full w-full object-cover",
        className
      )}
      {...props}
    />
  );
}

/**
 * Renders the crop area overlay within the cropper, applying visual styles for selection and focus.
 *
 * Combines default overlay, border, and focus ring styles with any additional classes provided.
 */
function CropperCropArea({
  className,
  ...props
}: React.ComponentProps<typeof CropperPrimitive.CropArea>) {
  return (
    <CropperPrimitive.CropArea
      data-slot="cropper-crop-area"
      className={cn(
        "pointer-events-none absolute border-3 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.3)] in-[[data-slot=cropper]:focus-visible]:ring-[3px] in-[[data-slot=cropper]:focus-visible]:ring-white/50",
        className
      )}
      {...props}
    />
  );
}

export { Cropper, CropperCropArea, CropperDescription, CropperImage };
