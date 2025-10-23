"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import React, { useCallback, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { renderCell } from "./fn/renderCell";
import { toggleRowSelection } from "./fn/toggleRowSelection";

export type ColumnType<T> = {
  title: string;
  accessor?: keyof T | string;
  type?: "date" | "currency" | "number";
  currency?: "PKR" | "SAR" | "EUR" | "JPY" | "USD" | "INR";
  format?: "en-PK" | "en-US" | "de-DE" | "ja-JP" | "en-IN";
  render?: (props: {
    row: T;
    index: number;
    data: T[];
    cell: any;
  }) => React.ReactNode;
  className?: string;
};

export interface MainTableProps<T = any> {
  data: T[];
  isLoading?: boolean;
  columns: ColumnType<T>[];
  rowId?: keyof T | string;
  selectedRows?: T[];
  setSelectedRows?:
    | React.Dispatch<React.SetStateAction<T[]>>
    | ((rows: T[]) => void);
  className?: string;
  striped?: boolean;
  fullScreen?: boolean;
  tdBodyClass?: (row: T) => string;
  tableWrapperClass?: string;
  selectionTitleTooltip?: string;
  selectionRowTooltip?: string;
  customtbody?: React.ReactNode;
  // Table Classes
  tableClass?: string;
  trHeadClass?: string;
  tHeadClass?: string;
  thHeadClass?: string;
  tableInsideClass?: string;
  tBodyClass?: string;
  trBodyClass?: string;
  stripedClass?: string;
}

/**
 * Reusable Data Table with shadcn components and TypeScript support.
 */
export function MainTable<T extends Record<string, any>>({
  data,
  isLoading,
  columns,
  rowId = "id",
  selectedRows = [],
  setSelectedRows,
  className,
  striped = true,
  fullScreen,
  tdBodyClass,
  tableWrapperClass = `${
    fullScreen ? "max-h-[calc(100vh-100px)]" : "max-h-[calc(100vh-300px)]"
  }`,
  selectionTitleTooltip,
  selectionRowTooltip,
  customtbody,
  // Table Classes
  tableClass,
  trHeadClass,
  tHeadClass,
  thHeadClass = "bg-muted text-muted-foreground border-b",
  tableInsideClass = "border border-border shadow-sm text-sm text-left p-3",
  tBodyClass,
  trBodyClass = "dark:hover:bg-muted/20 hover:bg-muted/30",
  stripedClass = "dark:bg-muted/10  bg-muted/40",
}: MainTableProps<T>) {
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    if (data.length > 0 && selectedRows.length === data.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedRows, data]);
  const toggleAll = useCallback(() => {
    if (!setSelectedRows) return;
    if (selectAll) setSelectedRows([]);
    else setSelectedRows(data);
    setSelectAll(!selectAll);
  }, [selectAll, data, setSelectedRows]);

  const TableHead = () => (
    <thead className={cn("border-none", tHeadClass)}>
      <tr className={cn("sticky top-0 z-10", trHeadClass)}>
        {setSelectedRows && (
          <th
            className={cn(
              tableInsideClass,
              thHeadClass,
              isLoading && "animate-pulse "
            )}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Checkbox
                    onCheckedChange={toggleAll}
                    checked={selectAll}
                    aria-label="Select All"
                  />
                </TooltipTrigger>
                {selectionTitleTooltip && (
                  <TooltipContent>{selectionTitleTooltip}</TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </th>
        )}
        {columns.map((col, idx) => (
          <th key={idx} className={cn("px-5", tableInsideClass, thHeadClass)}>
            <span
              className={cn("font-semibold ", isLoading && "animate-pulse")}
            >
              {col.title}
            </span>
          </th>
        ))}
      </tr>
    </thead>
  );

  const TableBody = () => (
    <tbody className={cn("font-medium", tBodyClass)}>
      {data.map((row, index) => (
        <tr
          key={String(row[rowId as keyof T] ?? index)}
          className={cn(
            "border-none",
            striped && index % 2 !== 0 && stripedClass,
            trBodyClass
          )}
        >
          {setSelectedRows && (
            <td
              className={cn(
                tableInsideClass,
                tdBodyClass?.(row),
                isLoading && "animate-pulse border border-border/10 bg-muted/10"
              )}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {toggleRowSelection(
                      row,
                      rowId as string,
                      selectedRows,
                      setSelectedRows
                    )}
                  </TooltipTrigger>
                  {selectionRowTooltip && (
                    <TooltipContent>{selectionRowTooltip}</TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </td>
          )}

          {columns.map((column, colIdx) => (
            <td
              key={colIdx}
              className={twMerge(
                "p-0 m-0 px-5 overflow-hidden",
                tableInsideClass,
                tdBodyClass?.(row),
                column.className,
                isLoading && "animate-pulse border border-border/10 bg-muted/10"
              )}
            >
              {renderCell(row, column, index, data)}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );

  return (
    <div className=" w-full relative">
      <div
        className={cn("overflow-auto mx-auto  ", tableWrapperClass, className)}
      >
        <table
          className={cn(
            "table-auto border-separate border-spacing-0 min-w-full",
            tableClass
          )}
        >
          {TableHead()}
          {customtbody ?? TableBody()}
        </table>
      </div>
    </div>
  );
}

export default MainTable;
