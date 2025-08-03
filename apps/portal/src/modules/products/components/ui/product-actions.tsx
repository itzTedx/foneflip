"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { IconCopy, IconEdit } from "@tabler/icons-react";
import { ArchiveRestoreIcon, Ellipsis, Share2Icon } from "lucide-react";
import { toast } from "sonner";

import { IconTrashFilled } from "@ziron/ui/assets/icons";
import { Badge } from "@ziron/ui/badge";
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

interface DeleteProductResult {
  success?: string;
  error?: string;
  data?: {
    id: string;
    title: string;
    slug: string;
  };
}

export const ProductActions = ({ id, title }: { id: string; title: string }) => {
  const [dialog, setDialog] = useState<DialogType>(null);
  const [isDeletePending, startDeleteTransition] = useTransition();
  const router = useRouter();

  /**
   * Deletes the product identified by `id` and provides user feedback based on the operation's outcome.
   *
   * Closes the confirmation dialog, refreshes the page, and displays a success or error toast depending on whether the deletion was successful.
   */
  function handleDelete() {
    startDeleteTransition(async () => {
      const result: DeleteProductResult = await deleteProduct(id);
      if (result.success) {
        setDialog(null);
        router.refresh();
        toast.success(result.success);
      }
      if (result.error) {
        toast.error(result.error);
      }
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="z-10 size-7" size={"icon"} variant={"ghost"}>
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href={`/products/${id}?title=${encodeURIComponent(title)}`}>
                <IconEdit aria-hidden="true" className="opacity-60" size={16} />
                <span>Edit</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem disabled title="Coming soon">
              <IconCopy aria-hidden="true" className="opacity-60" size={16} />
              <span>Duplicate</span>
              <Badge className="ml-auto" variant={"outline"}>
                Under dev
              </Badge>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem disabled title="Under development">
              <Share2Icon aria-hidden="true" className="opacity-60" size={16} />
              <span>Share</span>
              <Badge className="ml-auto" variant={"outline"}>
                Under dev
              </Badge>
            </DropdownMenuItem>
            <DropdownMenuItem disabled title="Under development">
              <ArchiveRestoreIcon aria-hidden="true" className="opacity-60" size={16} />
              <span>Archive</span>
              <Badge className="ml-auto" variant={"outline"}>
                Under dev
              </Badge>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDialog("delete")} variant="destructive">
            <IconTrashFilled aria-hidden="true" />
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
