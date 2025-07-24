import { useTransition } from "react";
import Image from "next/image";
import { deleteMediaFromS3 } from "@/features/media/actions/mutations";
import { formatBytes } from "@/hooks/use-file-upload";
import { IconX } from "@tabler/icons-react";

import { Button } from "@ziron/ui/components/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormContext,
} from "@ziron/ui/components/form";
import { Input } from "@ziron/ui/components/input";
import { toast } from "@ziron/ui/components/sonner";
import { CollectionFormType } from "@ziron/validators";

interface Props {
  value: CollectionFormType["thumbnail"] | null;
  files: File[];
  name: "thumbnail" | "banner";
  onRemove: () => void;
}

export const ImagePreview = ({ value, onRemove, files, name }: Props) => {
  const form = useFormContext<CollectionFormType>();
  const [isPending, startTransition] = useTransition();
  //   console.log(`value for ${name}: `, value);

  function handleOnRemove() {
    startTransition(async () => {
      if (value && value.file && value.file.key) {
        // console.log(value.file.key);
        const res = await deleteMediaFromS3(value.file.key);
        if (res.success) toast.success(res.success);
      }
      onRemove();
    });
  }

  return (
    <div className="bg-accent/30 relative h-fit rounded-md border border-dashed p-2">
      <Button
        type="button"
        variant="destructive"
        size="icon"
        className="absolute top-1 right-1 z-10 size-6 rounded-full"
        onClick={handleOnRemove}
        aria-label={`Remove ${name}`}
        disabled={isPending}
      >
        <IconX className="size-3" />
      </Button>

      <div className="relative mb-3 aspect-5/3 overflow-hidden rounded-sm">
        {value && value.file && (
          <Image
            src={value.file.url}
            alt={value.alt ?? "Uploaded Image"}
            fill
            className="object-cover"
          />
        )}
      </div>
      <div className="mb-3 flex items-center justify-between">
        <p
          className="line-clamp-1 font-medium"
          title={value?.file?.name ?? files[0]?.name}
        >
          {value?.file?.name ?? files[0]?.name}
        </p>

        <div className="text-muted-foreground flex shrink-0 items-center divide-x text-xs">
          <p className="pr-2 font-medium">
            {formatBytes(value?.file?.size ?? files[0]?.size ?? 0)}
          </p>
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
              <Input
                {...field}
                placeholder="Enter alt text for accessibility"
                className="w-full"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
