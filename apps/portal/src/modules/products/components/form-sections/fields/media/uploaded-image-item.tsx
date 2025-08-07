"use client";

import { IconX } from "@tabler/icons-react";

import { Button } from "@ziron/ui/button";
import { cn } from "@ziron/utils";

interface UploadedImageItemProps {
  image: {
    file: {
      url?: string;
      name?: string;
      size?: number;
    };
    metadata?: {
      width?: number;
      height?: number;
      blurData?: string;
    };
    isPrimary?: boolean;
  };
  index: number;
  onRemove: (index: number) => void;
  onToggleFeatured: (index: number) => void;
  className?: string;
}

export function UploadedImageItem({ image, index, onRemove, onToggleFeatured, className }: UploadedImageItemProps) {
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div
      className={cn(
        "relative flex items-center gap-2.5 rounded-md border p-3 transition-colors hover:bg-accent/50",
        image.isPrimary && "ring-2 ring-primary",
        className
      )}
    >
      {/* Image Preview */}
      <div className="relative flex size-28 shrink-0 items-center justify-center overflow-hidden rounded border bg-accent/50">
        {image.file.url ? (
          <img alt={image.file.name || `Image ${index + 1}`} className="size-full object-cover" src={image.file.url} />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <span className="text-xs">No Preview</span>
          </div>
        )}

        {/* Featured Badge */}
        {image.isPrimary && (
          <div className="-top-1 -right-1 absolute rounded-full bg-primary px-1.5 py-0.5 font-medium text-primary-foreground text-xs">
            Featured
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-medium text-sm">{image.file.name || `Image ${index + 1}`}</span>
        <span className="truncate text-muted-foreground text-xs">{formatFileSize(image.file.size)}</span>
        {image.metadata?.width && image.metadata?.height && (
          <span className="truncate text-muted-foreground text-xs">
            {image.metadata.width} × {image.metadata.height}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Toggle Featured Button */}
        <Button
          className="size-6 rounded-full"
          onClick={() => onToggleFeatured(index)}
          size="icon"
          variant={image.isPrimary ? "default" : "secondary"}
        >
          <span className="text-xs">★</span>
        </Button>

        {/* Remove Button */}
        <Button className="size-6 rounded-full" onClick={() => onRemove(index)} size="icon" variant="secondary">
          <IconX className="size-3" />
        </Button>
      </div>
    </div>
  );
}
