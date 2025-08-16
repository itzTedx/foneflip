import { useTransition } from "react";
import Image from "next/image";

import { IconX } from "@tabler/icons-react";

import { Button } from "@ziron/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, useFormContext } from "@ziron/ui/form";
import { Input } from "@ziron/ui/input";
import { toast } from "@ziron/ui/sonner";
import { CollectionFormType } from "@ziron/validators";

import { formatBytes } from "@/hooks/use-file-upload";
import { deleteMediaFromS3 } from "@/modules/media/actions/mutations";

interface Props {
  value: CollectionFormType["thumbnail"] | null;
  files: File[];
  name: "thumbnail" | "banner";
  onRemove: () => void;
}

export const ImagePreview = ({ value, onRemove, files, name }: Props) => {
  const form = useFormContext<CollectionFormType>();
  const [isPending, startTransition] = useTransition();

  function handleOnRemove() {
    startTransition(async () => {
      if (value && value.file && value.file.key) {
        const res = await deleteMediaFromS3(value.file.key);
        if (res.success) toast.success(res.success);
      }
      onRemove();
    });
  }

  return (
    <div className="relative h-fit rounded-md border border-dashed bg-accent/30 p-2">
      <Button
        aria-label={`Remove ${name}`}
        className="absolute top-1 right-1 z-10 size-6 rounded-full"
        disabled={isPending}
        onClick={handleOnRemove}
        size="icon"
        type="button"
        variant="destructive"
      >
        <IconX className="size-3" />
      </Button>

      <div className="relative mb-3 aspect-5/3 overflow-hidden rounded-sm">
        {value && value.file && (
          <Image alt={value.alt ?? "Uploaded Image"} className="object-cover" fill src={value.file.url} />
        )}
      </div>
      <div className="mb-3 flex items-center justify-between">
        <p className="line-clamp-1 font-medium" title={value?.file?.name ?? files[0]?.name}>
          {value?.file?.name ?? files[0]?.name}
        </p>

        <div className="flex shrink-0 items-center divide-x text-muted-foreground text-xs">
          <p className="pr-2 font-medium">{formatBytes(value?.file?.size ?? files[0]?.size ?? 0)}</p>
          <p className="pl-2 font-medium">
            {value?.metadata?.height}x{value?.metadata?.width}
          </p>
        </div>
      </div>
      <FormField
        control={form.control}
        name={`${name}.alt` as `thumbnail.alt` | `banner.alt`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Alternative text</FormLabel>
            <FormControl>
              <Input {...field} className="w-full" placeholder="Enter alt text for accessibility" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
