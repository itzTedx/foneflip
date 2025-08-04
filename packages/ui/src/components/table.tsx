"use client";

import * as React from "react";

import { cn } from "@ziron/utils";

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div className="relative w-full overflow-x-auto" data-slot="table-container">
      <table className={cn("w-full caption-bottom text-sm", className)} data-slot="table" {...props} />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead className={cn("[&_tr]:border-b", className)} data-slot="table-header" {...props} />;
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} data-slot="table-body" {...props} />;
}

/**
 * Renders a styled table footer (`<tfoot>`) with a muted background, top border, and medium font weight.
 *
 * Additional class names and props are merged into the element. The footer removes the bottom border from its last row.
 */
function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
      data-slot="table-footer"
      {...props}
    />
  );
}

/**
 * Renders a table row with hover and selected state styling.
 *
 * Applies background color changes on hover and when selected, along with a bottom border and transition effects. Additional props are spread onto the `<tr>` element.
 */
function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted data-[state=selected]:shadow-[2px_0_0_0_var(--primary)_inset]",
        className
      )}
      data-slot="table-row"
      {...props}
    />
  );
}

/**
 * Renders a styled table header cell (`<th>`) with support for custom class names and slot identification.
 *
 * Applies alignment, padding, font, and whitespace styles, and adjusts layout if containing a checkbox element.
 */
function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      className={cn(
        "h-10 whitespace-nowrap px-2 text-left align-middle font-medium text-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      data-slot="table-head"
      {...props}
    />
  );
}

/**
 * Renders a styled table cell (`<td>`) element with customizable class names and support for checkbox alignment.
 *
 * Additional props are spread onto the `<td>` element.
 */
function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      className={cn(
        "whitespace-nowrap p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      data-slot="table-cell"
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption className={cn("mt-4 text-muted-foreground text-sm", className)} data-slot="table-caption" {...props} />
  );
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
