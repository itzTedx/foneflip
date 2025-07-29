"use client";

import { useEffect, useState } from "react";

import { IconCheck } from "@tabler/icons-react";
import { parseAsBoolean, useQueryState } from "nuqs";
import { toast } from "sonner";

import { IconImageFilled, IconLoader } from "@ziron/ui/assets/icons";
import { Button } from "@ziron/ui/button";
import {
  Dialog,
  DialogContainer,
  DialogContent,
  DialogContentContainer,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogIcon,
  DialogTitle,
} from "@ziron/ui/dialog";
import { ScrollArea, ScrollBar } from "@ziron/ui/scroll-area";
import { cn } from "@ziron/utils";

import { Media } from "@/modules/collections/types";

import { getMedia } from "../actions/queries";
import { MediaImage } from "./media";

interface Props {
  multiple?: boolean;
  value?: Media;
  onSelect: (value: Media | Media[]) => void;
}

export const MediaPickerModal = ({ multiple = false, value, onSelect }: Props) => {
  const [open, setOpen] = useQueryState("existing-media", parseAsBoolean.withDefault(false));
  const [mediaItems, setMediaItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Media[]>([]);

  useEffect(() => {
    if (open) {
      setLoading(true);
      getMedia()
        .then((items) => {
          setMediaItems(items.media);
          setLoading(false);
        })
        .finally(() => setLoading(false));
      setSelected([]);
    }
  }, [open]);

  const handleSelect = (media: Media) => {
    if (multiple) {
      setSelected((prev) =>
        prev.some((m) => m.id === media.id) ? prev.filter((m) => m.id !== media.id) : [...prev, media]
      );
    } else {
      onSelect(media);
      setOpen(false);
      toast.success("Media selected from library");
    }
  };

  const handleConfirm = () => {
    if (multiple && selected.length > 0) {
      onSelect(selected);
      setOpen(false);
      toast.success(`${selected.length} item(s) selected from library`);
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent className="sm:max-w-7xl">
        <DialogContainer>
          <DialogIcon>
            <IconImageFilled className="size-5" />
          </DialogIcon>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-1">Select Existing Media</DialogTitle>
            <DialogDescription>Please fix the errors to product</DialogDescription>
          </DialogHeader>
        </DialogContainer>
        <DialogContentContainer className="gap-0 divide-y p-0 ">
          <ScrollArea className="max-h-[80svh]">
            {loading ? (
              <div className="flex min-h-[80svh] items-center justify-center">
                <IconLoader className="size-8 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 grid-rows-[auto_auto] gap-4 p-4 md:grid-cols-5">
                {mediaItems.map((media, i) => {
                  const isActive = multiple
                    ? selected.some((m) => m.id === media.id)
                    : value && media.url === value.url;
                  return (
                    <button
                      aria-selected={!!isActive}
                      className={cn(
                        "group relative cursor-pointer overflow-hidden rounded-sm ring-primary hover:ring-2",
                        isActive && "ring-2"
                      )}
                      key={media.id}
                      onClick={() => handleSelect(media)}
                      type="button"
                    >
                      <MediaImage index={i} media={media} />
                      {isActive && (
                        <span className="absolute top-2 right-2 z-20 rounded-full bg-primary p-1 text-white">
                          <IconCheck size={16} />
                        </span>
                      )}

                      <div className="absolute bottom-0 left-0 z-20 line-clamp-1 w-full overflow-hidden truncate p-3 text-start text-xs opacity-0 transition group-hover:opacity-100">
                        {media.fileName}
                      </div>
                      <div className="absolute inset-x-0 bottom-0 h-1/2 rounded-md bg-gradient-to-t from-background/70 to-transparent opacity-0 transition group-hover:opacity-100" />
                    </button>
                  );
                })}
              </div>
            )}
            <ScrollBar />
          </ScrollArea>
          {multiple && (
            <DialogFooter className="flex justify-end border-t p-3">
              <Button disabled={selected.length === 0} onClick={handleConfirm} type="button">
                Select {selected.length > 0 ? `(${selected.length})` : ""}
              </Button>
            </DialogFooter>
          )}
        </DialogContentContainer>
      </DialogContent>
    </Dialog>
  );
};
