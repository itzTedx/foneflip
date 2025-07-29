"use client";

import { IconUpload } from "@tabler/icons-react";
import { parseAsBoolean, useQueryState } from "nuqs";

import { Button } from "@ziron/ui/button";

export const UploadButton = () => {
  const [, setOpen] = useQueryState("media-upload", parseAsBoolean);
  return (
    <Button onClick={() => setOpen(true)}>
      <IconUpload />
      Upload
    </Button>
  );
};
