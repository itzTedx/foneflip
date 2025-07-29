"use client";

import { MediaQueryResult } from "@/modules/collections/types";
import { IconDownload, IconTrash } from "@tabler/icons-react";
import Image from "next/image";
import { memo, useCallback, useState } from "react";

import { Button } from "@ziron/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@ziron/ui/sheet";
import { formatDate, formatFileSize } from "@ziron/utils";

const PLACEHOLDER_IMG = "/placeholder.svg";

export const MediaCard = memo(function MediaCard({
  media,
  index,
}: {
  media: MediaQueryResult;
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const handleOpenChange = useCallback((val: boolean) => setOpen(val), []);
  const src = media.url || PLACEHOLDER_IMG;
  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger
        className="group cursor-pointer"
        asChild
        aria-label={media.alt || media.fileName || "Open image details"}
      >
        <div className="bg-muted relative grid aspect-square place-content-center overflow-hidden rounded-md border">
          <Image
            src={src}
            width={300}
            height={300}
            quality={30}
            {...(index < 2 ? { priority: true } : { loading: "lazy" })}
            className="animate-fade-in object-contain object-center transition-[filter_transform] ease-out group-hover:scale-105 group-hover:brightness-110"
            alt={media.alt ?? ""}
            placeholder={media.blurData ? "blur" : "empty"}
            blurDataURL={media.blurData ?? ""}
          />
        </div>
      </SheetTrigger>

      <SheetContent
        transition={{ type: "spring", stiffness: 250, damping: 25 }}
      >
        <SheetHeader className="flex-row items-center justify-between border-b px-4 py-3">
          <SheetTitle>About the image</SheetTitle>
        </SheetHeader>
        <div className="grid w-full flex-1 auto-rows-min p-4">
          <div className="relative">
            <Image
              src={src}
              width={media.width! || 300}
              height={media.height! || 300}
              quality={50}
              className="max-h-96 rounded-md border object-contain"
              alt={media.alt ?? ""}
              placeholder={media.blurData ? "blur" : "empty"}
              blurDataURL={media.blurData ?? ""}
            />
          </div>
          <div className="mt-4 overflow-hidden rounded-sm border p-3">
            <h3 className="font-medium">
              {formatDate(media.createdAt, {
                includeTime: true,
                showDayOfWeek: true,
              })}
            </h3>
            <h4 className="text-muted-foreground text-sm">{media.fileName}</h4>
            <div className="mt-4 text-sm">
              <h5 className="font-medium">Image info</h5>
              <div className="text-muted-foreground flex divide-x">
                <p className="pr-2">{formatFileSize(media.fileSize ?? 0)}</p>
                <p className="px-2">
                  {media.width} x {media.height}
                </p>
              </div>
            </div>
            <div className="mt-4 text-sm">
              <h5 className="font-medium">Details</h5>
              <div className="text-muted-foreground">
                <p className="">Uploaded by {media.user.name}</p>
                <div>
                  <p>Used in:</p>
                </div>
              </div>
            </div>
            {/* <div className="mt-4 text-sm">
                  <MediaAltForm alt={media.alt} id={media.id} />
                </div> */}
          </div>
        </div>
        <SheetFooter className="border-t">
          <Button variant="outline">
            <IconDownload className="size-3.5" />
            Download
          </Button>
          <SheetClose asChild>
            <Button variant="destructive">
              <IconTrash className="size-3.5" />
              Delete
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
});
