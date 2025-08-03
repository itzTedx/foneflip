import { IconAlertHexagonFilled, IconCircleCheckFilled } from "@tabler/icons-react";
import { ColumnDef, FilterFn } from "@tanstack/react-table";

import { Avatar, AvatarFallback, AvatarImage } from "@ziron/ui/avatar";
import { Checkbox } from "@ziron/ui/checkbox";
import { StatusBadge, StatusBadgeDot, StatusBadgeIcon } from "@ziron/ui/status-badge";
import { formatDate } from "@ziron/utils";

import { User } from "@/modules/collections/types";

import { RowActions } from "./row-actions";

// Custom filter function for multi-column searching
export const multiColumnFilterFn: FilterFn<User> = (row, columnId, filterValue) => {
  const searchableRowContent = `${row.original.name} ${row.original.email}`.toLowerCase();
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
        aria-label="Select all"
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    size: 18,
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
            <AvatarFallback className="rounded-md">{name.slice(0, 1)}</AvatarFallback>
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
        <StatusBadge className="capitalize" status={isVerified ? "success" : "warn"}>
          <StatusBadgeIcon as={isVerified ? IconCircleCheckFilled : IconAlertHexagonFilled} />
          {isVerified ? "Verified" : "Pending"}
        </StatusBadge>
      );
    },
    size: 80,
  },
  {
    header: "Role",
    accessorKey: "role",
    cell: ({ row }) => {
      const role = row.getValue("role") as "user" | "vendor" | "admin" | "dev";
      return (
        <StatusBadge
          className="capitalize"
          status={role === "admin" ? "success" : role === "vendor" ? "info" : role === "dev" ? "error" : "disabled"}
          variant="light"
        >
          <StatusBadgeDot />
          {role}
        </StatusBadge>
      );
    },
    size: 80,
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
