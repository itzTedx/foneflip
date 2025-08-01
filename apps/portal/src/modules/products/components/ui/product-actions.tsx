"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { IconCopy, IconEdit } from "@tabler/icons-react";
import { ArchiveRestoreIcon, Ellipsis, Share2Icon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@ziron/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ziron/ui/dropdown-menu";

import { ActionConfirmDialog } from "@/components/ui/action-confirm-dialog";

import { deleteProduct } from "../../actions/mutations";

type DialogType = null | "delete" | "archive";

export const ProductActions = ({ id, title }: { id: string; title: string }) => {
  const [dialog, setDialog] = useState<DialogType>(null);
  const [isDeletePending, startDeleteTransition] = useTransition();
  const router = useRouter();

  /**
   * Deletes the collection identified by `id` and provides user feedback based on the operation's outcome.
   *
   * Closes the confirmation dialog, refreshes the page, and displays a success or error toast depending on whether the deletion was successful.
   */
  function handleDelete() {
    startDeleteTransition(async () => {
      const result = await deleteProduct(id);
      if (result.success) {
        const message = (result as { message?: string }).message;
        setDialog(null);
        router.refresh();
        toast.success(typeof message === "string" ? message : "Collection Deleted successfully");
      }
      if (!result.success) {
        const message = (result as { message?: string }).message;
        toast.error(typeof message === "string" ? message : "An error occurred");
      }
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="size-7" size={"icon"} variant={"ghost"}>
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href={`/products/${id}?title=${title.replace(" ", "+")}`}>
                <IconEdit aria-hidden="true" className="opacity-60" size={16} />
                <span>Edit</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <IconCopy aria-hidden="true" className="opacity-60" size={16} />
              <span>Duplicate</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Share2Icon aria-hidden="true" className="opacity-60" size={16} />
              <span>Share</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <ArchiveRestoreIcon aria-hidden="true" className="opacity-60" size={16} />
              <span>Archive</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDialog("delete")} variant="destructive">
            <Trash2Icon aria-hidden="true" size={16} />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ActionConfirmDialog
        isLoading={isDeletePending}
        onConfirm={handleDelete}
        onOpenChange={(open) => setDialog(open ? "delete" : null)}
        open={dialog === "delete"}
      />
    </>
  );
};
