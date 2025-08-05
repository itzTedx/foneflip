import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import { ArrowLeftIcon, XIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@ziron/ui/avatar";
import { Button } from "@ziron/ui/button";
import { Cropper, CropperCropArea, CropperDescription, CropperImage } from "@ziron/ui/cropper";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@ziron/ui/dialog";
import { useFormContext } from "@ziron/ui/form";
import { LoadingSwap } from "@ziron/ui/loading-swap";
import { Slider } from "@ziron/ui/slider";

import { useFileUpload } from "@/hooks/use-file-upload";
import { getSignedURL } from "@/modules/media/actions/mutations";
import { computeSHA256 } from "@/modules/media/utils/compute-sha256";
import { deleteAvatar } from "@/modules/users/actions/mutation";

import { ProfileFormType } from "../profile-schema";

// Define type for pixel crop area
type Area = { x: number; y: number; width: number; height: number };

// Helper function to create a cropped image blob
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous"); // Needed for canvas Tainted check
    image.src = url;
  });

/**
 * Crops an image from a given source URL to the specified pixel area and returns the result as a JPEG blob.
 *
 * @param imageSrc - The source URL of the image to crop.
 * @param pixelCrop - The pixel coordinates and dimensions of the crop area.
 * @param outputWidth - The width of the output image in pixels. Defaults to the crop area's width.
 * @param outputHeight - The height of the output image in pixels. Defaults to the crop area's height.
 * @returns A Promise that resolves to a JPEG Blob of the cropped image, or `null` if cropping fails.
 */
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  outputWidth: number = pixelCrop.width, // Optional: specify output size
  outputHeight: number = pixelCrop.height
): Promise<Blob | null> {
  try {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return null;
    }

    // Set canvas size to desired output size
    canvas.width = outputWidth;
    canvas.height = outputHeight;

    // Draw the cropped image onto the canvas
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      outputWidth, // Draw onto the output size
      outputHeight
    );

    // Convert canvas to blob
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        "image/jpeg",
        0.7
      ); // Specify format and quality if needed
    });
  } catch (error) {
    console.error("Error in getCroppedImg:", error);
    return null;
  }
}

interface Props {
  form: ReturnType<typeof useFormContext<ProfileFormType>>;
  avatar: string | null;
}

export const AvatarUpload = ({ form, avatar }: Props) => {
  const [isPending, startTransition] = useTransition();
  const [
    { files, isDragging },
    { handleDragEnter, handleDragLeave, handleDragOver, handleDrop, openFileDialog, removeFile, getInputProps },
  ] = useFileUpload({
    accept: "image/*",
  });

  const previewUrl = files[0]?.preview || null;
  const fileId = files[0]?.id;

  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(avatar);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Ref to track the previous file ID to detect new uploads
  const previousFileIdRef = useRef<string | undefined | null>(null);

  // State to store the desired crop area in pixels
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // State for zoom level
  const [zoom, setZoom] = useState<number>(1);

  // Callback for Cropper to provide crop data - Wrap with useCallback
  const handleCropChange = useCallback((pixels: Area | null) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleApply = () => {
    // Check if we have the necessary data
    if (!previewUrl || !fileId || !croppedAreaPixels) {
      console.error("Missing data for apply:", {
        previewUrl,
        fileId,
        croppedAreaPixels,
      });
      // Remove file if apply is clicked without crop data?
      if (fileId) {
        removeFile(fileId);
        setCroppedAreaPixels(null);
      }
      return;
    }
    startTransition(async () => {
      try {
        // 1. Get the cropped image blob using the helper
        const croppedBlob = await getCroppedImg(previewUrl, croppedAreaPixels);

        if (!croppedBlob) {
          throw new Error("Failed to generate cropped image blob.");
        }

        const checksum = await computeSHA256(croppedBlob);

        const signedUrl = await getSignedURL({
          file: {
            type: "image/jpeg",
            size: croppedBlob.size,
            fileName: "avatar.jpg",
          },
          collection: "avatar",
          checksum: checksum,
        });

        if (signedUrl.error !== undefined) {
          form.setError("avatarUrl", new Error(signedUrl.message));
        }

        if (signedUrl.success) {
          const url = signedUrl.success.url;

          const xhr = new XMLHttpRequest();
          xhr.open("PUT", url, true);
          xhr.setRequestHeader("Content-Type", "image/jpeg");
          xhr.setRequestHeader("Content-Language", croppedBlob.size.toString());

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              form.clearErrors("avatarUrl");
              form.setValue("avatarUrl", url.split("?")[0] ?? "");
            } else {
              form.setError("avatarUrl", new Error("Upload failed"));
            }
          };

          xhr.onerror = (error) => {
            form.setError("avatarUrl", new Error("Upload error"));
            console.error(error);
          };

          xhr.send(croppedBlob);
        }

        // 2. Create a NEW object URL from the cropped blob
        const newFinalUrl = URL.createObjectURL(croppedBlob);

        // 3. Revoke the OLD finalImageUrl if it exists
        if (finalImageUrl) {
          URL.revokeObjectURL(finalImageUrl);
        }

        // 4. Set the final avatar state to the NEW URL
        setFinalImageUrl(newFinalUrl);

        // 5. Close the dialog (don't remove the file yet)
        setIsDialogOpen(false);
      } catch (error) {
        console.error("Error during apply:", error);
        // Close the dialog even if cropping fails
        setIsDialogOpen(false);
      }
    });
  };

  const handleRemoveFinalImage = async () => {
    if (finalImageUrl) {
      URL.revokeObjectURL(finalImageUrl);
    }
    setFinalImageUrl(null);
    form.setValue("avatarUrl", undefined);
    await deleteAvatar();
  };

  useEffect(() => {
    const currentFinalUrl = finalImageUrl;
    // Cleanup function
    return () => {
      if (currentFinalUrl && currentFinalUrl.startsWith("blob:")) {
        URL.revokeObjectURL(currentFinalUrl);
      }
    };
  }, [finalImageUrl]);

  // Effect to open dialog when a *new* file is ready
  useEffect(() => {
    // Check if fileId exists and is different from the previous one
    if (fileId && fileId !== previousFileIdRef.current) {
      setIsDialogOpen(true); // Open dialog for the new file
      setCroppedAreaPixels(null); // Reset crop area for the new file
      setZoom(1); // Reset zoom for the new file
    }
    // Update the ref to the current fileId for the next render
    previousFileIdRef.current = fileId;
  }, [fileId]); // Depend only on fileId

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative inline-flex">
        {/* Drop area - uses finalImageUrl */}
        <button
          aria-label={finalImageUrl ? "Change image" : "Upload image"}
          className="relative flex size-32 items-center justify-center overflow-hidden rounded-full border-2 border-input border-dashed outline-none transition-colors hover:bg-accent/50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-disabled:pointer-events-none has-disabled:opacity-50 data-[dragging=true]:bg-accent/50"
          data-dragging={isDragging || undefined}
          onClick={openFileDialog}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          type="button"
        >
          <Avatar className="size-full rounded-full bg-accent/30 p-2">
            <AvatarImage alt="User avatar" className="rounded-full" src={finalImageUrl ?? undefined} />
            <AvatarFallback className="rounded-full font-medium text-sm">Upload</AvatarFallback>
          </Avatar>
        </button>
        {/* Remove button - depends on finalImageUrl */}
        {finalImageUrl && (
          <Button
            aria-label="Remove image"
            className="absolute top-2 right-2 size-6 rounded-full border-2 shadow-none"
            onClick={handleRemoveFinalImage}
            size="btn"
            variant="destructive"
          >
            <XIcon className="size-3.5" />
          </Button>
        )}
        <input {...getInputProps()} aria-label="Upload image file" className="sr-only" tabIndex={-1} />
      </div>

      {/* Cropper Dialog - Use isDialogOpen for open prop */}
      <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
        <DialogContent className="gap-0 p-0 sm:max-w-140 *:[button]:hidden">
          <DialogDescription className="sr-only">Crop image dialog</DialogDescription>
          <DialogHeader className="contents space-y-0 text-left">
            <DialogTitle className="flex items-center justify-between border-b p-4 text-base">
              <div className="flex items-center gap-2">
                <Button
                  aria-label="Cancel"
                  className="-my-1 opacity-60"
                  onClick={() => setIsDialogOpen(false)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <ArrowLeftIcon aria-hidden="true" />
                </Button>
                <span>Crop image</span>
              </div>
              <Button autoFocus className="-my-1" disabled={!previewUrl || isPending} onClick={handleApply}>
                <LoadingSwap isLoading={isPending}>Apply</LoadingSwap>
              </Button>
            </DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <Cropper
              className="h-96 sm:h-120"
              image={previewUrl}
              onCropChange={handleCropChange}
              onZoomChange={setZoom}
              zoom={zoom}
            >
              <CropperDescription />
              <CropperImage />
              <CropperCropArea />
            </Cropper>
          )}
          <DialogFooter className="border-t px-4 py-6">
            <div className="mx-auto flex w-full max-w-80 items-center gap-4">
              <ZoomOutIcon aria-hidden="true" className="size-3.5 shrink-0 opacity-60" />
              <Slider
                aria-label="Zoom slider"
                defaultValue={[1]}
                max={3}
                min={1}
                onValueChange={(value) => setZoom(value[0]!)}
                showTooltip
                step={0.1}
                tooltipContent={(value) => `${value}x`}
                value={[zoom]}
              />
              <ZoomInIcon aria-hidden="true" className="size-3.5 shrink-0 opacity-60" />
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
