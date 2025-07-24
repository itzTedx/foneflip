"use client";

import { useCallback, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconCopy, IconEdit, IconRestore } from "@tabler/icons-react";
import {
  ArchiveRestoreIcon,
  Ellipsis,
  Share2Icon,
  TrashIcon,
} from "lucide-react";
import { toast } from "sonner";

import { collectionStatusEnum } from "@ziron/db/schema";
import { Button } from "@ziron/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ziron/ui/components/dropdown-menu";

import {
  deleteCollection,
  duplicateCollection,
  setCollectionStatus,
} from "../actions/mutations";
import { ActionConfirmDialog } from "./ui/action-confirm-dialog";

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

  function handleDuplicate() {
    startDuplicateTransition(async () => {
      const result = await duplicateCollection(id);
      if (result.success) {
        router.refresh();
        const message = (result as { message?: string }).message;
        toast.success(
          typeof message === "string"
            ? message
            : "Collection Duplicated successfully",
        );
      }
      if (!result.success) {
        const message = (result as { message?: string }).message;
        toast.error(
          typeof message === "string" ? message : "An error occurred",
        );
      }
    });
  }

  function handleDelete() {
    startDeleteTransition(async () => {
      const result = await deleteCollection(id);
      if (result.success) {
        const message = (result as { message?: string }).message;
        setDialog(null);
        router.refresh();
        toast.success(
          typeof message === "string"
            ? message
            : "Collection Deleted successfully",
        );
      }
      if (!result.success) {
        const message = (result as { message?: string }).message;
        toast.error(
          typeof message === "string" ? message : "An error occurred",
        );
      }
    });
  }

  function handleCollectionStatus({
    status,
  }: {
    status: (typeof collectionStatusEnum)["enumValues"][number];
  }) {
    startStatusTransition(async () => {
      const result = await setCollectionStatus(id, status);
      if (result.success) {
        const message = (result as { message?: string }).message;
        setDialog(null);
        router.refresh();
        toast.success(
          typeof message === "string"
            ? message
            : "Collection status changed successfully",
        );
      }
      if (!result.success) {
        const message = (result as { message?: string }).message;
        toast.error(
          typeof message === "string" ? message : "An error occurred",
        );
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
          <Button
            size="icon"
            variant="ghost"
            className="size-7"
            aria-label="Open actions menu"
          >
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link
                href={`/collections/${id}?=${title}`}
                aria-label="Edit collection"
              >
                <IconEdit size={16} className="opacity-60" aria-hidden="true" />
                <span>Edit</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDuplicate}
              aria-label="Duplicate collection"
            >
              <IconCopy size={16} className="opacity-60" aria-hidden="true" />
              <span>Duplicate</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem aria-label="Share collection">
              <Share2Icon size={16} className="opacity-60" aria-hidden="true" />
              <span>Share</span>
            </DropdownMenuItem>

            {status === "archived" ? (
              <DropdownMenuItem
                onClick={handleSetActive}
                aria-label="Set as Active"
              >
                <IconRestore
                  size={16}
                  className="opacity-60"
                  aria-hidden="true"
                />
                <span>Restore from Archive</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => setDialog("archive")}
                aria-label="Move to Archive"
              >
                <ArchiveRestoreIcon
                  size={16}
                  className="opacity-60"
                  aria-hidden="true"
                />
                <span>Move to Archive</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDialog("delete")}
            aria-label="Delete collection"
          >
            <TrashIcon className="text-destructive size-4" aria-hidden="true" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ActionConfirmDialog
        open={dialog === "delete"}
        onOpenChange={(open) => setDialog(open ? "delete" : null)}
        onConfirm={handleDelete}
        isLoading={isDeletePending}
      />
      <ActionConfirmDialog
        open={dialog === "archive"}
        onOpenChange={(open) => setDialog(open ? "archive" : null)}
        onConfirm={handleArchive}
        isLoading={isStatusPending}
      />
    </>
  );
};
