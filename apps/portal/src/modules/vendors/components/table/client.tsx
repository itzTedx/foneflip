"use client";

import React, { useId, useState } from "react";

import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";

import { Label } from "@ziron/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ziron/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ziron/ui/table";
import { cn } from "@ziron/utils";

import { InvitationType } from "../../types";
import { columns } from "./columns";
import { DataTableHeader } from "./header";
import { TablePagination } from "./pagination";

interface Props {
  data: InvitationType[];
  initialPageSize?: number;
}

/**
 * Renders a paginated, sortable, filterable, and column-configurable table of vendor invitations with persistent pagination state.
 *
 * Displays vendor invitation data in a table with support for sorting, filtering, column visibility toggling, and pagination. Pagination state is synchronized with URL query parameters and persisted in a cookie for consistent user experience across sessions and shared URLs.
 *
 * @param data - The array of vendor invitation objects to display in the table.
 * @param initialPageSize - Optional initial number of rows per page if not specified in the URL.
 * @returns The rendered vendor invitations table component.
 */ export default function UsersTable({ data, initialPageSize }: Props) {
  const id = useId();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "createdAt",
      desc: false,
    },
  ]);

  // nuqs pagination state (1-based for URL, 0-based for table)
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState("pageSize", parseAsInteger.withDefault(10));

  // On mount, if no pageSize in URL, use initialPageSize from cookie
  React.useEffect(() => {
    const urlPageSize = new URLSearchParams(window.location.search).get("pageSize");
    if (!urlPageSize && initialPageSize) {
      setPageSize(initialPageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPageSize]);

  // When pageSize changes, set cookie using document.cookie
  React.useEffect(() => {
    document.cookie = `vendor_invitations_table_pageSize=${pageSize}; path=/; max-age=${60 * 60 * 24 * 365}`;
  }, [pageSize]);

  // Sync TanStack Table pagination with nuqs
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: Math.max(0, page - 1),
    pageSize: pageSize,
  });

  // When nuqs page/pageSize changes, update table pagination
  React.useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: Math.max(0, page - 1),
      pageSize: pageSize,
    }));
  }, [page, pageSize]);

  // When table pagination changes, update nuqs
  React.useEffect(() => {
    if (pagination.pageIndex + 1 !== page) setPage(pagination.pageIndex + 1);
    if (pagination.pageSize !== pageSize) setPageSize(pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.pageIndex, pagination.pageSize]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <div className="space-y-4">
      <DataTableHeader data={data} table={table} />

      {/* Table */}
      <div className="overflow-hidden rounded-md border bg-background">
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow className="bg-card hover:bg-card" key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead className="h-10" key={header.id} style={{ width: `${header.getSize()}px` }}>
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <div
                          className={cn(
                            header.column.getCanSort() &&
                              "flex h-full cursor-pointer select-none items-center justify-between gap-2"
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                          onKeyDown={(e) => {
                            // Enhanced keyboard handling for sorting
                            if (header.column.getCanSort() && (e.key === "Enter" || e.key === " ")) {
                              e.preventDefault();
                              header.column.getToggleSortingHandler()?.(e);
                            }
                          }}
                          tabIndex={header.column.getCanSort() ? 0 : undefined}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <ChevronUpIcon aria-hidden="true" className="shrink-0 opacity-60" size={16} />,
                            desc: <ChevronDownIcon aria-hidden="true" className="shrink-0 opacity-60" size={16} />,
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow data-state={row.getIsSelected() && "selected"} key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className="last:py-0" key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="h-24 text-center" colSpan={columns.length}>
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-8">
        {/* Results per page */}
        <div className="flex items-center gap-3">
          <Label className="max-sm:sr-only" htmlFor={id}>
            Rows per page
          </Label>
          <Select
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
            value={table.getState().pagination.pageSize.toString()}
          >
            <SelectTrigger className="w-fit whitespace-nowrap" id={id}>
              <SelectValue placeholder="Select number of results" />
            </SelectTrigger>
            <SelectContent className="[&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8">
              {[5, 10, 25, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Page number information */}
        <div className="flex grow justify-end whitespace-nowrap text-muted-foreground text-sm">
          <p aria-live="polite" className="whitespace-nowrap text-muted-foreground text-sm">
            <span className="text-foreground">
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
              {Math.min(
                Math.max(
                  table.getState().pagination.pageIndex * table.getState().pagination.pageSize +
                    table.getState().pagination.pageSize,
                  0
                ),
                table.getRowCount()
              )}
            </span>{" "}
            of <span className="text-foreground">{table.getRowCount().toString()}</span>
          </p>
        </div>

        <TablePagination table={table} />
      </div>
    </div>
  );
}
