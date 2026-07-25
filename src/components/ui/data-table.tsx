import type { ReactNode } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export type Column<T> = {
  key: string;
  header: string;
  /** Numbers and money go right; everything else stays left. */
  align?: "left" | "right";
  cell: (row: T) => ReactNode;
  className?: string;
};

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** Supplying this is what makes rows look and behave clickable. */
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  /** Height of the scroll region. Viewport-relative so it adapts to the display. */
  maxHeight?: string;
};

const alignClass = (align: Column<unknown>["align"]) =>
  align === "right" ? "text-right tabular-nums" : "text-left";

/**
 * The one table used across the admin pages. It owns the scroll region, the
 * sticky header, column alignment, and the loading and empty states, so those
 * behave identically everywhere instead of being re-decided per page.
 */
const DataTable = <T,>({
  columns,
  rows,
  rowKey,
  onRowClick,
  isLoading = false,
  emptyMessage = "Nothing to show yet.",
  maxHeight = "max-h-[60vh]",
}: Props<T>) => {
  const isClickable = Boolean(onRowClick);

  return (
    <Table containerClassName={cn("custom-scrollbar", maxHeight)}>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {columns.map((column) => (
            <TableHead
              key={column.key}
              // Sticky lives on the cells rather than the row: with
              // border-collapse the thead background and border do not stick.
              className={cn(
                "bg-table-header sticky top-0 z-10 shadow-[inset_0_-1px_0_var(--border)]",
                alignClass(column.align),
                column.className,
              )}
            >
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={columns.length} className="h-32">
              <div className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
                <Spinner className="size-4" />
                Loading
              </div>
            </TableCell>
          </TableRow>
        ) : rows.length === 0 ? (
          <TableRow className="hover:bg-transparent">
            <TableCell
              colSpan={columns.length}
              className="text-muted-foreground h-32 text-center text-sm"
            >
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row) => (
            <TableRow
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(isClickable && "cursor-pointer")}
            >
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  className={cn(alignClass(column.align), column.className)}
                >
                  {column.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default DataTable;
