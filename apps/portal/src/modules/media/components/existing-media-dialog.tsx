"use client";

import { parseAsBoolean, useQueryState } from "nuqs";

import { Dialog, DialogContent } from "@ziron/ui/dialog";

export const ExistingMediaDialog = () => {
  const [open, setOpen] = useQueryState("existing-media", parseAsBoolean.withDefault(false));
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent>Choose existing media dialog</DialogContent>
    </Dialog>
  );
};
