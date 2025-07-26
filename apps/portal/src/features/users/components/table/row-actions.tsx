import { Row } from "@tanstack/react-table";
import { EllipsisIcon } from "lucide-react";


import { User } from "@ziron/auth";
import { authClient } from "@ziron/auth/client";
import { IconAdminFilled, IconCrownFilled } from "@ziron/ui/assets/icons";
import { Button } from "@ziron/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@ziron/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";



export function RowActions({ row }: { row: Row<User> }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleRole(role: 'user' | "vendor" | "admin" | "dev") {
    startTransition(async () => {
      const { data, error } = await authClient.admin.setRole({
        userId: row.original.id,
        role: role,
      }); 

      if (error) {
        toast.error(error.message)
      }
      if (data) {
        toast.success("Role updated successfully", { description: `User: ${data.user.name} role has been changed to "${data.user.role}"` })
        router.refresh()
      }
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex justify-end">
          <Button
            size="icon"
            variant="ghost"
            className="shadow-none"
            aria-label="Edit item"
          >
            <EllipsisIcon size={16} aria-hidden="true" />
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">

        <DropdownMenuGroup>
        
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Set Role</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => handleRole("user")}>User</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRole("vendor")}>Vendor</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem  onClick={() => handleRole("admin")}><IconAdminFilled /> Admin</DropdownMenuItem>
                <DropdownMenuItem  onClick={() => handleRole("dev")}><IconCrownFilled /> Dev</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Share</DropdownMenuItem>
          <DropdownMenuItem>Add to favorites</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive">
          <span>Delete</span>
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
