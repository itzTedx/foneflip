"use client";

import { parseAsBoolean, useQueryState } from "nuqs";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@ziron/ui/dialog";

export const ExistingMediaDialog = () => {
  const [open, setOpen] = useQueryState("existing-media", parseAsBoolean.withDefault(false));
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Media</DialogTitle>
          <DialogDescription>Choose media from the exiting bucket</DialogDescription>
        </DialogHeader>
        Choose existing media dialog
      </DialogContent>
    </Dialog>
  );
};
