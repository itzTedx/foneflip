import Image from "next/image";

import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { IconGripVertical, IconStar, IconTrash } from "@tabler/icons-react";

import { Button } from "@ziron/ui/button";
import { formatFileSize } from "@ziron/utils";
import { MediaFormType } from "@ziron/validators";

import { IconButton } from "@/components/ui/icon-button";
import { SimpleTooltip } from "@/components/ui/tooltip";

type ProductImagePreviewCardProps = {
  media: MediaFormType;
  onMarkFeatured?: () => void;
  onRemove?: () => void;
  onDrag?: () => void;
  showActions?: boolean;
  dragListeners?: SyntheticListenerMap;
};

/**
 * Displays a preview card for a product image with thumbnail, file information, and optional action buttons for marking as featured, removing, or dragging.
 *
 * @param media - The image data.
 * @param onMarkFeatured - Callback invoked when marking the image as featured.
 * @param onRemove - Callback invoked when removing the image.
 * @param onDrag - Callback invoked when initiating a drag action.
 * @param showActions - Whether to display action buttons for feature, remove, and drag.
 * @param dragListeners - Drag event listeners for drag-and-drop functionality.
 */
export const ImagePreviewCard = ({
  media,
  onMarkFeatured,
  onRemove,
  onDrag,
  showActions = false,
  dragListeners,
}: ProductImagePreviewCardProps) => {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border bg-background p-1.5 pe-3">
      <div className="flex items-center gap-2">
        <div className="relative aspect-square size-16 shrink-0 overflow-hidden rounded-sm border bg-card">
          <Image
            alt={media.file?.name ?? ""}
            className="h-full w-full object-cover"
            fill
            quality={50}
            src={media.file?.url ?? "/images/product-placeholder.webp"}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="truncate font-medium text-xs">{media.file?.name ?? ""}</p>
          <div className="mt-0.5 flex items-center divide-x text-muted-foreground text-xs">
            <p className="pr-1">{formatFileSize(media.file?.size ?? 0)}</p>
            <p className="pl-1">
              {media.metadata?.width} x {media.metadata?.height}
            </p>
          </div>
        </div>
      </div>
      {showActions && (
        <div className="flex items-center gap-2">
          <SimpleTooltip asChild tooltip="Mark as featured">
            <IconButton
              active={media.isPrimary}
              aria-label={"Mark as featured"}
              icon={IconStar}
              onClick={onMarkFeatured}
              size="sm"
              type="button"
            />
          </SimpleTooltip>
          <Button
            aria-label={`Remove ${media.file?.name}`}
            className="-me-2 size-8 text-muted-foreground/80 hover:bg-transparent hover:text-foreground"
            onClick={onRemove}
            size="icon"
            type="button"
            variant="ghost"
          >
            <IconTrash className="size-3.5" />
          </Button>
          <Button
            size="btn"
            type="button"
            variant="ghost"
            {...dragListeners}
            aria-label="Drag to reorder"
            className="ml-2 w-auto cursor-grab text-muted-foreground/60"
            onClick={onDrag}
            style={{ touchAction: "none" }}
          >
            <IconGripVertical className="size-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
};
