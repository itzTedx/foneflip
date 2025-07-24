import {
  StatusBadge,
  StatusBadgeIcon,
} from "@/components/ui/status-badge-align";
import { User } from "@/features/collections/types";
import { IconCheck, IconCircleCheckFilled, IconX } from "@tabler/icons-react";
import { ColumnDef, FilterFn } from "@tanstack/react-table";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@ziron/ui/components/avatar";
import { Checkbox } from "@ziron/ui/components/checkbox";
import { cn, formatDate } from "@ziron/utils";

import { RowActions } from "./row-actions";

// Custom filter function for multi-column searching
export const multiColumnFilterFn: FilterFn<User> = (
  row,
  columnId,
  filterValue,
) => {
  const searchableRowContent =
    `${row.original.name} ${row.original.email}`.toLowerCase();
  const searchTerm = (filterValue ?? "").toLowerCase();
  return searchableRowContent.includes(searchTerm);
};

const roleFilterFn: FilterFn<User> = (row, columnId, filterValue: string[]) => {
  if (!filterValue?.length) return true;
  const role = row.getValue(columnId) as string;
  return filterValue.includes(role);
};

export const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    size: 28,
    enableSorting: false,
    enableHiding: false,
  },
  {
    header: "Name",
    accessorKey: "name",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      const avatar = row.original.image as string | undefined;
      return (
        <div className="flex items-center gap-2 font-medium">
          <Avatar className="size-10 rounded-md">
            <AvatarImage src={avatar} />
            <AvatarFallback className="rounded-md">
              {name.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
          {name}
        </div>
      );
    },
    size: 180,
    filterFn: multiColumnFilterFn,
    enableHiding: false,
  },

  {
    header: "Email",
    accessorKey: "email",
    size: 220,
  },
  {
    header: "Verified",
    accessorKey: "emailVerified",
    cell: ({ row }) => {
      const isVerified = row.getValue("emailVerified") === true;
      return (
        <div
          className={cn(
            "flex size-5 items-center justify-center rounded-sm border [&_svg]:size-3",
            isVerified
              ? "border-success text-success bg-success/20"
              : "border-destructive text-destructive bg-destructive/20",
          )}
        >
          {isVerified ? <IconCheck /> : <IconX />}
        </div>
      );
    },
    size: 60,
  },
  {
    header: "Role",
    accessorKey: "role",
    cell: ({ row }) => (
      <StatusBadge status="completed" className="capitalize">
        <StatusBadgeIcon as={IconCircleCheckFilled} />
        {row.getValue("role")}
      </StatusBadge>
    ),
    size: 100,
    filterFn: roleFilterFn,
  },

  {
    header: "Created At",
    accessorKey: "createdAt",
    cell: ({ row }) => {
      const data = row.getValue("createdAt") as string;
      const formatted = formatDate(data, { includeTime: true });
      return formatted;
    },
    size: 120,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <RowActions row={row} />,
    size: 60,
    enableHiding: false,
  },
];
