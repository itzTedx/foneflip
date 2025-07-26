
import { Table } from "@tanstack/react-table";
import {
  CircleAlertIcon,
  CircleXIcon,
  Columns3Icon,
  FilterIcon,
  ListFilterIcon,
  TrashIcon,
} from "lucide-react";
import { useId, useMemo, useRef } from "react";

import type { User } from "@ziron/auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@ziron/ui/alert-dialog";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@ziron/ui/popover";
import { cn } from "@ziron/utils";

// import { Item } from "./columns";

interface Props {
  table: Table<User>;
  data: User[];
}
export const DataTableHeader = ({ table, data }: Props) => {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDeleteRows = () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const updatedData = data.filter(
      (item) => !selectedRows.some((row) => row.original.id === item.id),
    );
    // setData(updatedData);
    table.resetRowSelection();
  };

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

    table
      .getColumn("role")
      ?.setFilterValue(newFilterValue.length ? newFilterValue : undefined);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {/* Filter by name or email */}
        <div className="relative">
          <Input
            id={`${id}-input`}
            ref={inputRef}
            className={cn(
              "peer min-w-60 ps-9",
              Boolean(table.getColumn("name")?.getFilterValue()) && "pe-9",
            )}
            value={(table.getColumn("name")?.getFilterValue() ?? "") as string}
            onChange={(e) =>
              table.getColumn("name")?.setFilterValue(e.target.value)
            }
            placeholder="Filter by name or email..."
            type="text"
            aria-label="Filter by name or email"
          />
          <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
            <ListFilterIcon size={16} aria-hidden="true" />
          </div>
          {Boolean(table.getColumn("name")?.getFilterValue()) && (
            <button
              className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Clear filter"
              onClick={() => {
                table.getColumn("name")?.setFilterValue("");
                if (inputRef.current) {
                  inputRef.current.focus();
                }
              }}
            >
              <CircleXIcon size={16} aria-hidden="true" />
            </button>
          )}
        </div>
        {/* Filter by role */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <FilterIcon
                className="-ms-1 opacity-60"
                size={16}
                aria-hidden="true"
              />
              Role
              {selectedRoles.length > 0 && (
                <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                  {selectedRoles.length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto min-w-36 p-3" align="start">
            <div className="space-y-3">
              <div className="text-muted-foreground text-xs font-medium">
                Filters
              </div>
              <div className="space-y-3">
                {uniqueRoleValues.map((value, i) => (
                  <div key={value} className="flex items-center gap-2">
                    <Checkbox
                      id={`${id}-${i}`}
                      checked={selectedRoles.includes(value)}
                      onCheckedChange={(checked: boolean) =>
                        handleRoleChange(checked, value)
                      }
                    />
                    <Label
                      htmlFor={`${id}-${i}`}
                      className="flex grow justify-between gap-2 font-normal capitalize"
                    >
                      {value}{" "}
                      <span className="text-muted-foreground ms-2 text-xs">
                        {roleCounts.get(value)}
                      </span>
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
              <Columns3Icon
                className="-ms-1 opacity-60"
                size={16}
                aria-hidden="true"
              />
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
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                    onSelect={(event) => event.preventDefault()}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center gap-3">
        {/* Delete button */}
        {table.getSelectedRowModel().rows.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="ml-auto" variant="outline">
                <TrashIcon
                  className="-ms-1 opacity-60"
                  size={16}
                  aria-hidden="true"
                />
                Delete
                <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                  {table.getSelectedRowModel().rows.length}
                </span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border"
                  aria-hidden="true"
                >
                  <CircleAlertIcon className="opacity-80" size={16} />
                </div>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete{" "}
                    {table.getSelectedRowModel().rows.length} selected{" "}
                    {table.getSelectedRowModel().rows.length === 1
                      ? "row"
                      : "rows"}
                    .
                  </AlertDialogDescription>
                </AlertDialogHeader>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteRows}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
};
