import { useId, useMemo, useRef } from "react";

import { Table } from "@tanstack/react-table";
import { CircleXIcon, Columns3Icon, FilterIcon, ListFilterIcon } from "lucide-react";

import { Button } from "@ziron/ui/button";
import { Checkbox } from "@ziron/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@ziron/ui/dropdown-menu";
import { Input } from "@ziron/ui/input";
import { Label } from "@ziron/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@ziron/ui/popover";
import { cn } from "@ziron/utils";

import { User } from "@/modules/collections/types";

// import { Item } from "./columns";

interface Props {
  table: Table<User>;
  data: User[];
}
export const DataTableHeader = ({ table, data }: Props) => {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  // Get unique role values
  const uniqueRoleValues = useMemo(() => {
    const roleColumn = table.getColumn("role");

    if (!roleColumn) return [];

    const values = Array.from(roleColumn.getFacetedUniqueValues().keys());

    return values.sort();
  }, [table.getColumn("role")?.getFacetedUniqueValues()]);

  // Get counts for each role
  const roleCounts = useMemo(() => {
    const roleColumn = table.getColumn("role");
    if (!roleColumn) return new Map();
    return roleColumn.getFacetedUniqueValues();
  }, [table.getColumn("role")?.getFacetedUniqueValues()]);

  const selectedRoles = useMemo(() => {
    const filterValue = table.getColumn("role")?.getFilterValue() as string[];
    return filterValue ?? [];
  }, [table.getColumn("role")?.getFilterValue()]);

  const handleRoleChange = (checked: boolean, value: string) => {
    const filterValue = table.getColumn("role")?.getFilterValue() as string[];
    const newFilterValue = filterValue ? [...filterValue] : [];

    if (checked) {
      newFilterValue.push(value);
    } else {
      const index = newFilterValue.indexOf(value);
      if (index > -1) {
        newFilterValue.splice(index, 1);
      }
    }

    table.getColumn("role")?.setFilterValue(newFilterValue.length ? newFilterValue : undefined);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {/* Filter by name or email */}
        <div className="relative">
          <Input
            aria-label="Filter by name or email"
            className={cn("peer min-w-60 ps-9", Boolean(table.getColumn("name")?.getFilterValue()) && "pe-9")}
            id={`${id}-input`}
            onChange={(e) => table.getColumn("name")?.setFilterValue(e.target.value)}
            placeholder="Filter by name or email..."
            ref={inputRef}
            type="text"
            value={(table.getColumn("name")?.getFilterValue() ?? "") as string}
          />
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
            <ListFilterIcon aria-hidden="true" size={16} />
          </div>
          {Boolean(table.getColumn("name")?.getFilterValue()) && (
            <button
              aria-label="Clear filter"
              className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 outline-none transition-[color,box-shadow] hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => {
                table.getColumn("name")?.setFilterValue("");
                if (inputRef.current) {
                  inputRef.current.focus();
                }
              }}
            >
              <CircleXIcon aria-hidden="true" size={16} />
            </button>
          )}
        </div>
        {/* Filter by role */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <FilterIcon aria-hidden="true" className="-ms-1 opacity-60" size={16} />
              Role
              {selectedRoles.length > 0 && (
                <span className="-me-1 inline-flex h-5 max-h-full items-center rounded border bg-background px-1 font-[inherit] font-medium text-[0.625rem] text-muted-foreground/70">
                  {selectedRoles.length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto min-w-36 p-3">
            <div className="space-y-3">
              <div className="font-medium text-muted-foreground text-xs">Filters</div>
              <div className="space-y-3">
                {uniqueRoleValues.map((value, i) => (
                  <div className="flex items-center gap-2" key={value}>
                    <Checkbox
                      checked={selectedRoles.includes(value)}
                      id={`${id}-${i}`}
                      onCheckedChange={(checked: boolean) => handleRoleChange(checked, value)}
                    />
                    <Label className="flex grow justify-between gap-2 font-normal capitalize" htmlFor={`${id}-${i}`}>
                      {value} <span className="ms-2 text-muted-foreground text-xs">{roleCounts.get(value)}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
        {/* Toggle columns visibility */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Columns3Icon aria-hidden="true" className="-ms-1 opacity-60" size={16} />
              View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    checked={column.getIsVisible()}
                    className="capitalize"
                    key={column.id}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    onSelect={(event) => event.preventDefault()}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* <div className="flex items-center gap-3"> */}
      {/* Delete button */}
      {/* {table.getSelectedRowModel().rows.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="ml-auto" variant="outline">
                <TrashIcon aria-hidden="true" className="-ms-1 opacity-60" size={16} />
                Delete
                <span className="-me-1 inline-flex h-5 max-h-full items-center rounded border bg-background px-1 font-[inherit] font-medium text-[0.625rem] text-muted-foreground/70">
                  {table.getSelectedRowModel().rows.length}
                </span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
                <div
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border"
                >
                  <CircleAlertIcon className="opacity-80" size={16} />
                </div>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete {table.getSelectedRowModel().rows.length}{" "}
                    selected {table.getSelectedRowModel().rows.length === 1 ? "row" : "rows"}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteRows}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )} */}
      {/* </div> */}
    </div>
  );
};
