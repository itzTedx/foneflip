import { Table } from "@tanstack/react-table";
import { ChevronFirstIcon, ChevronLastIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@ziron/ui/button";
import { Pagination, PaginationContent, PaginationItem } from "@ziron/ui/pagination";

import { User } from "@/modules/collections/types";

// import { Item } from "./columns";

interface Props {
  table: Table<User>;
}

export const TablePagination = ({ table }: Props) => {
  return (
    <div>
      <Pagination>
        <PaginationContent>
          {/* First page button */}
          <PaginationItem>
            <Button
              aria-label="Go to first page"
              className="disabled:pointer-events-none disabled:opacity-50"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.firstPage()}
              size="icon"
              variant="outline"
            >
              <ChevronFirstIcon aria-hidden="true" size={16} />
            </Button>
          </PaginationItem>
          {/* Previous page button */}
          <PaginationItem>
            <Button
              aria-label="Go to previous page"
              className="disabled:pointer-events-none disabled:opacity-50"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              size="icon"
              variant="outline"
            >
              <ChevronLeftIcon aria-hidden="true" size={16} />
            </Button>
          </PaginationItem>
          {/* Next page button */}
          <PaginationItem>
            <Button
              aria-label="Go to next page"
              className="disabled:pointer-events-none disabled:opacity-50"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              size="icon"
              variant="outline"
            >
              <ChevronRightIcon aria-hidden="true" size={16} />
            </Button>
          </PaginationItem>
          {/* Last page button */}
          <PaginationItem>
            <Button
              aria-label="Go to last page"
              className="disabled:pointer-events-none disabled:opacity-50"
              disabled={!table.getCanNextPage()}
              onClick={() => table.lastPage()}
              size="icon"
              variant="outline"
            >
              <ChevronLastIcon aria-hidden="true" size={16} />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
