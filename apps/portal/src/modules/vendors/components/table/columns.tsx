"use client";

import { ColumnDef, FilterFn } from "@tanstack/react-table";

import { StatusBadge, StatusBadgeDot } from "@ziron/ui/status-badge";
import { cn, formatDate } from "@ziron/utils";

import { InvitationType } from "../../types";
import { RowActions } from "./row-actions";
import { getTimeUntilExpiry } from "./utils";

// Custom filter function for multi-column searching
const multiColumnFilterFn: FilterFn<InvitationType> = (row, filterValue) => {
  const searchableRowContent = `${row.original.vendorName} ${row.original.vendorEmail}`.toLowerCase();
  const searchTerm = (filterValue ?? "").toLowerCase();
  return searchableRowContent.includes(searchTerm);
};

const statusFilterFn: FilterFn<InvitationType> = (row, columnId, filterValue: string[]) => {
  if (!filterValue?.length) return true;
  const status = row.getValue(columnId) as string;
  return filterValue.includes(status);
};

export const columns: ColumnDef<InvitationType>[] = [
  {
    header: "Name",
    accessorKey: "vendorName",
    cell: ({ row }) => <div className="font-medium">{row.getValue("vendorName")}</div>,
    size: 80,
    filterFn: multiColumnFilterFn,
    enableHiding: false,
  },
  {
    header: "Email",
    accessorKey: "vendorEmail",
    size: 80,
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <StatusBadge
          className="capitalize"
          status={
            status === "accepted"
              ? "success"
              : status === "pending"
                ? "info"
                : status === "revoked"
                  ? "error"
                  : "disabled"
          }
          variant="light"
        >
          <StatusBadgeDot />
          {status}
        </StatusBadge>
      );
    },
    size: 60,
    filterFn: statusFilterFn,
  },
  {
    header: "Expires In",
    accessorKey: "expiresAt",
    cell: ({ row }) => (
      <dt className={cn(["accepted", "expired", "revoked"].includes(row.getValue("status") as string) && "sr-only")}>
        {getTimeUntilExpiry(row.getValue("expiresAt") as Date)}
      </dt>
    ),
    size: 60,
  },
  {
    header: "Created At",
    accessorKey: "createdAt",
    cell: ({ row }) => {
      const data = row.getValue("createdAt") as string;
      const formatted = formatDate(data, { includeTime: true });
      return formatted;
    },
    size: 60,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <RowActions row={row} />,
    size: 40,
    enableHiding: false,
  },
];
