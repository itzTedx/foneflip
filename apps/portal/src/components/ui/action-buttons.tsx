import Link from "next/link";

import {
  IconAddCircleFilled,
  IconExportFilled,
  IconFileEditFilled,
  IconSaveFilled,
  IconUnarchiveFilled,
} from "@ziron/ui/assets/icons";
import { Button, buttonVariants } from "@ziron/ui/components/button";
import { LoadingSwap } from "@ziron/ui/components/loading-swap";
import { VariantProps } from "@ziron/utils";

export const SaveButton = ({
  isLoading,
  isEditMode,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    isLoading: boolean;
    isEditMode: boolean;
  }) => {
  return (
    <Button type="submit" {...props}>
      <LoadingSwap
        isLoading={isLoading}
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap"
      >
        <IconSaveFilled className="-ml-1 size-4" />
        {isEditMode ? (
          <span>
            Save <span className="hidden sm:inline">Changes</span>
          </span>
        ) : (
          <span>
            Create <span className="hidden sm:inline">Collection</span>
          </span>
        )}
      </LoadingSwap>
    </Button>
  );
};

export const DraftButton = ({
  isLoading,
  isEditMode,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    isLoading: boolean;
    isEditMode?: boolean;
  }) => {
  return (
    <Button variant="outline" {...props}>
      <LoadingSwap
        isLoading={isLoading}
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap"
      >
        <IconFileEditFilled className="text-muted-foreground -ml-1 size-4" />
        <div>
          <span className="hidden sm:inline">Save as </span>Draft
        </div>
      </LoadingSwap>
    </Button>
  );
};

export const RestoreArchiveButton = ({
  isLoading,

  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    isLoading: boolean;
  }) => {
  return (
    <Button
      type="button"
      className="from-success shadow-success/20 text-success-foreground to-emerald-500"
      {...props}
    >
      <LoadingSwap
        isLoading={isLoading}
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap"
      >
        <IconUnarchiveFilled className="-ml-1 size-4" />
        <div>Unarchive</div>
      </LoadingSwap>
    </Button>
  );
};

export const AddButton = ({
  href,
  title,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    href: string;
    title: string;
  }) => {
  return (
    <Button asChild {...props} className="gap-1.5">
      <Link href={href}>
        <IconAddCircleFilled />
        <span>
          Add <span className="sr-only md:not-sr-only">{title}</span>
        </span>
      </Link>
    </Button>
  );
};

export const ExportButton = ({
  isLoading,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    isLoading?: boolean;
  }) => {
  return (
    <Button variant="outline" {...props}>
      <LoadingSwap
        isLoading={isLoading ?? false}
        className="flex items-center gap-2"
      >
        <IconExportFilled />
        Export
      </LoadingSwap>
    </Button>
  );
};
