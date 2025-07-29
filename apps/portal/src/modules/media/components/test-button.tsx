"use client";

import { parseAsBoolean, useQueryState } from "nuqs";

import { Button } from "@ziron/ui/button";

export const TestButton = () => {
  const [_open, setOpen] = useQueryState("existing-media", parseAsBoolean);
  return <Button onClick={() => setOpen(true)}>Choose from existing</Button>;
};
