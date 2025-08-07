"use client";

import { useCallback, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { IconCopy, IconEdit, IconRestore } from "@tabler/icons-react";
import { ArchiveRestoreIcon, Ellipsis, Share2Icon, TrashIcon } from "lucide-react";
import { toast } from "sonner";

import { collectionStatusEnum } from "@ziron/db/schema";
import { Button } from "@ziron/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ziron/ui/dropdown-menu";

import { ActionConfirmDialog } from "../../../components/ui/action-confirm-dialog";
import { deleteCollection, duplicateCollection, setCollectionStatus } from "../actions/mutations";

interface Props {
  title: string;
  id: string;
  status: "draft" | "active" | "archived" | null;
}

type DialogType = null | "delete" | "archive";

export const ActionDropdown = ({ title, id, status }: Props) => {
  const [isDeletePending, startDeleteTransition] = useTransition();
  const [isStatusPending, startStatusTransition] = useTransition();
  const [isDuplicatePending, startDuplicateTransition] = useTransition();
  const router = useRouter();
  const [dialog, setDialog] = useState<DialogType>(null);

  /**
   * Duplicates the collection identified by `id` and displays a toast notification indicating success or failure.
   *
   * On successful duplication, refreshes the current route and shows a success message. On failure, displays an error message.
   */
  function handleDuplicate() {
    startDuplicateTransition(async () => {
      const result = await duplicateCollection(id);
      if (result.success) {
        router.refresh();
        const message = (result as { message?: string }).message;
        toast.success(typeof message === "string" ? message : "Collection Duplicated successfully");
      }
      if (!result.success) {
        const message = (result as { message?: string }).message;
        toast.error(typeof message === "string" ? message : "An error occurred");
      }
    });
  }

  /**
   * Deletes the collection identified by `id` and provides user feedback based on the operation's outcome.
   *
   * Closes the confirmation dialog, refreshes the page, and displays a success or error toast depending on whether the deletion was successful.
   */
  function handleDelete() {
    startDeleteTransition(async () => {
      const result = await deleteCollection(id);
      if (result.success) {
        const message = (result as { message?: string }).message;
        router.refresh();
        toast.success(typeof message === "string" ? message : "Collection Deleted successfully");
        setDialog(null);
      }
      if (!result.success) {
        const message = (result as { message?: string }).message;
        toast.error(typeof message === "string" ? message : "An error occurred");
      }
    });
  }

  /**
   * Updates the status of the collection and provides user feedback based on the operation's result.
   *
   * @param status - The new status to set for the collection.
   */
  function handleCollectionStatus({ status }: { status: (typeof collectionStatusEnum)["enumValues"][number] }) {
    startStatusTransition(async () => {
      const result = await setCollectionStatus(id, status);
      if (result.success) {
        const message = (result as { message?: string }).message;
        setDialog(null);
        router.refresh();
        toast.success(typeof message === "string" ? message : "Collection status changed successfully");
      }
      if (!result.success) {
        const message = (result as { message?: string }).message;
        toast.error(typeof message === "string" ? message : "An error occurred");
      }
    });
  }

  const handleArchive = useCallback(() => {
    handleCollectionStatus({ status: "archived" });
    setDialog(null);
  }, [id]);

  const handleSetActive = useCallback(() => {
    handleCollectionStatus({ status: "active" });
  }, [id]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button aria-label="Open actions menu" size="btn" variant="ghost">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link aria-label="Edit collection" href={`/collections/${id}?=${title}`}>
                <IconEdit aria-hidden="true" className="opacity-60" size={16} />
                <span>Edit</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem aria-label="Duplicate collection" onClick={handleDuplicate}>
              <IconCopy aria-hidden="true" className="opacity-60" size={16} />
              <span>Duplicate</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem aria-label="Share collection">
              <Share2Icon aria-hidden="true" className="opacity-60" size={16} />
              <span>Share</span>
            </DropdownMenuItem>

            {status === "archived" ? (
              <DropdownMenuItem aria-label="Set as Active" onClick={handleSetActive}>
                <IconRestore aria-hidden="true" className="opacity-60" size={16} />
                <span>Restore from Archive</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem aria-label="Move to Archive" onClick={() => setDialog("archive")}>
                <ArchiveRestoreIcon aria-hidden="true" className="opacity-60" size={16} />
                <span>Move to Archive</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem aria-label="Delete collection" onClick={() => setDialog("delete")} variant="destructive">
            <TrashIcon aria-hidden="true" className="size-4 text-destructive" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ActionConfirmDialog
        isLoading={isDeletePending}
        onConfirm={handleDelete}
        onOpenChange={(open) => setDialog(open ? "delete" : null)}
        open={dialog === "delete" || isDeletePending}
      />
      <ActionConfirmDialog
        isLoading={isStatusPending}
        onConfirm={handleArchive}
        onOpenChange={(open) => setDialog(open ? "archive" : null)}
        open={dialog === "archive"}
      />
    </>
  );
};
