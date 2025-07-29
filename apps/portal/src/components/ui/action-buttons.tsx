"use client";

import Link from "next/link";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@ziron/ui/alert-dialog";
import {
  IconAddCircleFilled,
  IconExportFilled,
  IconFileEditFilled,
  IconSaveFilled,
  IconUnarchiveFilled,
} from "@ziron/ui/assets/icons";
import { Button, buttonVariants } from "@ziron/ui/button";
import { LoadingSwap } from "@ziron/ui/loading-swap";
import { VariantProps } from "@ziron/utils";
import { ComponentProps, ReactNode, useTransition } from "react";
import { toast } from "sonner";

export const SaveButton = ({
  title,
  isLoading,
  isEditMode,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    title: string;
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
            Create <span className="hidden sm:inline">{title}</span>
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

/**
 * Renders a button that executes an asynchronous action, optionally requiring user confirmation before proceeding.
 *
 * If `requireAreYouSure` is true, the button displays a confirmation dialog with a customizable description before running the action. While the action is in progress, the button shows a loading indicator and is disabled. If the action returns an error, an error toast is displayed.
 *
 * @param action - An asynchronous function to execute when the button is activated. Should return an object with an `error` flag and optional `message`.
 * @param requireAreYouSure - If true, prompts the user for confirmation before executing the action.
 * @param areYouSureDescription - Optional description text shown in the confirmation dialog.
 * @returns A React element rendering the action button with optional confirmation and loading state.
 */
export function ActionButton({
  action,
  requireAreYouSure = false,
  areYouSureDescription = "This action cannot be undone.",
  ...props
}: ComponentProps<typeof Button> & {
  action: () => Promise<{ error: boolean; message?: string }>;
  requireAreYouSure?: boolean;
  areYouSureDescription?: ReactNode;
}) {
  const [isLoading, startTransition] = useTransition();

  function performAction() {
    startTransition(async () => {
      const data = await action();
      if (data.error) toast.error(data.message ?? "Error");
    });
  }

  if (requireAreYouSure) {
    return (
      <AlertDialog open={isLoading ? true : undefined}>
        <AlertDialogTrigger asChild>
          <Button {...props} />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {areYouSureDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isLoading} onClick={performAction}>
              <LoadingSwap isLoading={isLoading}>Yes</LoadingSwap>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Button
      {...props}
      disabled={props.disabled ?? isLoading}
      onClick={(e) => {
        performAction();
        props.onClick?.(e);
      }}
    >
      <LoadingSwap
        isLoading={isLoading}
        className="inline-flex items-center gap-2"
      >
        {props.children}
      </LoadingSwap>
    </Button>
  );
}
