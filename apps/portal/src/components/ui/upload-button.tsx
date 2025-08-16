import { useId } from "react";

import type { UploadHookControl } from "better-upload/client";
import { Loader2, Upload } from "lucide-react";

import { Button } from "@ziron/ui/button";

type UploadButtonProps = {
  control: UploadHookControl<false>;
  accept?: string;
  metadata?: Record<string, unknown>;
  uploadOverride?: (...args: Parameters<UploadHookControl<false>["upload"]>) => void;

  // Add any additional props you need.
};

export function UploadButton({ control: { upload, isPending }, accept, metadata, uploadOverride }: UploadButtonProps) {
  const id = useId();

  return (
    <Button className="relative" disabled={isPending} type="button">
      <label className="absolute inset-0 cursor-pointer" htmlFor={id}>
        <input
          accept={accept}
          className="absolute inset-0 size-0 opacity-0"
          id={id}
          onChange={(e) => {
            if (e.target.files?.[0] && !isPending) {
              if (uploadOverride) {
                uploadOverride(e.target.files[0], { metadata });
              } else {
                upload(e.target.files[0], { metadata });
              }
            }
            e.target.value = "";
          }}
          type="file"
        />
      </label>
      {isPending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Upload file
        </>
      ) : (
        <>
          <Upload className="size-4" />
          Upload file
        </>
      )}
    </Button>
  );
}
