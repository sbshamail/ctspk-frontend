# My way to code FrontEnd Doc Ai For Custom Table

## We are making the multivender ecommerce website in modern and professional way

## in this project we use next15, typscript, shadcn, rtk and redux query

## Custom Table

//=========================================

## Using

// =======================================

```js
import Table from "@/components/table";
import { Skeleton } from "@/components/ui/skeleton";

  const columns: ColumnType<OrderType>[] = [
    {
      title: "No.",
      render: ({ index }) => {
        const serial = (page - 1) * limit + (index + 1);
        return <span className="font-medium">{serial}</span>;
      },
      className: "w-[60px] text-center",
    },
    { title: "Tracking #", accessor: "tracking_number" },
    { title: "Customer", accessor: "customer_name" },
    { title: "Contact", accessor: "customer_contact" },
    {
      title: "Total",
      accessor: "total",
      type: "currency",
      currency: "PKR",
    },
  ]
{isLoading ? (
        <OrderTableSkeleton />
      ) : (
        <Table<OrderType>
          data={orders}
          columns={columns}
          isLoading={isFetching}
          striped={true}
          dataLimit={limit}
          setDataLimit={setLimit}
          total={total}
          currentPage={page}
          setCurrentPage={setPage}
          showPagination={true}
        />
      )}

      function OrderTableSkeleton() {
  return (
    <div className="space-y-4">
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
    </div>
  );
}

```

//=========================================

## Table

// =======================================

```js
import FullScreenDom from "@/@core/layout/FullScreenDom";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import MainTable, { MainTableProps } from "./MainTable";
import Pagination, { PaginationProps } from "./fn/Pagination";
import TableHeader from "./fn/TableHeader";

// Case 1: With Pagination
interface TableWithPagination<T = any>
  extends MainTableProps<T>,
    PaginationProps<T> {
  showPagination: true;
}

// Case 2: Without Pagination
interface TableWithoutPagination<T = any> extends MainTableProps<T> {
  showPagination?: false;
}

// Union type
export type TableProps<T = any> =
  | TableWithPagination<T>
  | TableWithoutPagination<T>;

export function Table<T extends Record<string, any>>(props: TableProps<T>) {
  const {
    data,
    columns,
    selectedRows,
    setSelectedRows,
    showPagination,
    ...rest
  } = props;
  const [fullScreen, setFullScreen] = useState(false);
  const headerRef = useRef<HTMLDivElement | null>(null);

  return (
    <FullScreenDom open={fullScreen}>
      <div
        className={cn(
          { "": !fullScreen },
          "shadow-2xl rounded-[20px] gap-2 bg-card",
          { "p-0 m-0 space-y-0 h-full": fullScreen }
        )}
      >
        <div ref={headerRef}>
          <TableHeader
            columns={columns}
            dates={{
              fromDate: null,
              setFromDate: () => {},
              toDate: null,
              setToDate: () => {},
            }}
            globalFilters={{ globalFilter: null, setGlobalFilter: () => {} }}
            showFullScreen={{ fullScreen, setFullScreen }}
          />
        </div>
        <MainTable<T>
          data={data}
          columns={columns}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          {...rest}
        />

        {showPagination && (
          <Pagination<T>
            currentPage={props.currentPage}
            setCurrentPage={props.setCurrentPage}
            dataLimit={props.dataLimit}
            setDataLimit={props.setDataLimit}
            total={props.total}
            dataLimitDisable={props.dataLimitDisable}
            setSelectedRows={props.setSelectedRows}
            removeSelection={props.removeSelection}
          />
        )}
      </div>
    </FullScreenDom>
  );
}

export default Table;

```

//=========================================

## Main Table

// =======================================

```js
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

```

//=========================================

## renderCell

// =======================================

```js
import { currencyFormatter } from "@/utils/helper";
import React from "react";
import { ColumnType } from "../MainTable";

export const renderCell = <T,>(
  item: T,
  column: ColumnType<T>,
  index: number,
  data: T[]
) => {
  const accessors = column.accessor?.toString().split(".");
  let value: any = item;
  accessors?.forEach((key) => {
    value = value?.[key as keyof typeof value];
  });

  if (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    !React.isValidElement(value)
  ) {
    value = JSON.stringify(value);
  }

  if (column.render) {
    const result = column.render({ row: item, index, data, cell: value });
    if (
      React.isValidElement(result) ||
      typeof result === "string" ||
      typeof result === "number"
    )
      return result;
    return <span className="text-destructive">Invalid Render</span>;
  }

  if (value === null || value === undefined)
    return <span className="text-muted-foreground">N/A</span>;

  switch (column.type) {
    // case "date":
    //   return formatDate(value);
    // case "number":
    //   return formatNumber(value);
    case "currency":
      return currencyFormatter(value, column.currency, column.format);
    default:
      return value;
  }
};

```

//=========================================

## toggleRowSelection

// =======================================

```js
import { Checkbox } from "@/components/ui/checkbox";
import React from "react";

/**
 * Safely access nested property in an object using dot notation.
 * Example: getNestedProperty(row, "product.id")
 */
function getNestedProperty(obj: any, path: string): any {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

/**
 * Toggles the selection of a single row in a table (supports nested ids like "product.id")
 */
export function toggleRowSelection<T extends Record<string, any>>(
  row: T,
  idProperty: keyof T | string,
  selectedRows: T[],
  setSelectedRows:
    | React.Dispatch<React.SetStateAction<T[]>>
    | ((rows: T[]) => void)
) {
  const id = getNestedProperty(row, idProperty as string);

  const isSelected = selectedRows.some(
    (s) => getNestedProperty(s, idProperty as string) === id
  );

  const toggle = () => {
    if (isSelected) {
      setSelectedRows(
        selectedRows.filter(
          (s) => getNestedProperty(s, idProperty as string) !== id
        )
      );
    } else {
      setSelectedRows([...selectedRows, row]);
    }
  };

  return <Checkbox checked={isSelected} onCheckedChange={toggle} />;
}

```

//=========================================

## Table Header

// =======================================

```js
// components/table/TableHeader.tsx
"use client";

import { useRef } from "react";

import FromToDateFilter, {
  FromToDateFilterTypes,
} from "../filters/FromToDateFilter";
import GlobalFilter, { GlobalFilterType } from "../filters/GlobalFilter";
import FullScreenTable, { FullScreenTableType } from "./FullScreenTable";

export interface HeaderType {
  // @ts-ignore
  headerAction?: () => JSX.Element;
  dates?: FromToDateFilterTypes;
  globalFilters?: GlobalFilterType;
  columnsFilter?: any;
  showColumnFilterFields?: any;
  showFullScreen?: FullScreenTableType;
  // ColumnHideShowType extends ...
  showOnlyColumns?: any;
  setShowOnlyColumns?: (c: any) => void;
}

interface Props extends HeaderType {
  columns: any[]; // use your ColumnType[] here
}

export default function TableHeader({
  dates,
  headerAction,
  globalFilters,
  columnsFilter,
  showColumnFilterFields,
  showFullScreen,
}: Props) {
  const { fromDate, setFromDate, toDate, setToDate } = dates || {};

  showColumnFilterFields || {};
  const { setGlobalFilter, globalFilter } = globalFilters || {};
  const headerRef = (useRef < HTMLDivElement) | (null > null);

  return (
    <div ref={headerRef}>
      <div className="flex flex-col font-semibold space-y-3 p-4 rounded-t-2xl border border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {setFromDate && setToDate && (
              <FromToDateFilter
                fromDate={fromDate}
                setFromDate={setFromDate}
                toDate={toDate}
                setToDate={setToDate}
              />
            )}
          </div>

          <div className="flex items-center space-x-2">
            {setGlobalFilter && (
              <GlobalFilter
                setGlobalFilter={setGlobalFilter}
                globalFilter={globalFilter}
              />
            )}

            {showFullScreen && (
              <FullScreenTable
                fullScreen={showFullScreen.fullScreen}
                setFullScreen={showFullScreen.setFullScreen}
              />
            )}
          </div>
        </div>

        {headerAction && <div>{headerAction()}</div>}
      </div>
    </div>
  );
}
```

//=========================================

## Pagination

// =======================================

```js
"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import * as React from "react";

export interface PaginationProps<T = any> {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  dataLimit: number;
  setDataLimit: (limit: number) => void;
  total: number;
  dataLimitDisable?: boolean;
  setSelectedRows?:
    | React.Dispatch<React.SetStateAction<T[]>>
    | ((rows: T[]) => void);
  removeSelection?: boolean;
}

export function Pagination<T extends Record<string, any>>({
  currentPage = 1,
  setCurrentPage,
  dataLimit,
  setDataLimit,
  total,
  dataLimitDisable,
  setSelectedRows,
  removeSelection = true,
}: PaginationProps<T>) {
  const pageCount = Math.ceil(total / dataLimit);

  const handlePageChange = (page: number) => {
    if (removeSelection && setSelectedRows) setSelectedRows([]);
    setCurrentPage(page);
  };

  const handleDataLimitChange = (size: number) => {
    setDataLimit(size);
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pages: number[] = [];
    let leftSide = currentPage - 2;
    let rightSide = currentPage + 2;

    if (leftSide <= 1) {
      rightSide = 5;
      leftSide = 1;
    }
    if (rightSide > pageCount) {
      leftSide = pageCount - 4;
      rightSide = pageCount;
      if (leftSide < 1) leftSide = 1;
    }

    for (let number = leftSide; number <= rightSide; number++) {
      if (number > 0 && number <= pageCount) pages.push(number);
    }

    return pages;
  };

  if (pageCount === 0) return null;

  return (
    <div className="w-full sticky right-0 bottom-0 z-10 flex justify-end items-center p-2 px-4 gap-4 bg-card shadow border border-border rounded-lg rounded-t-none text-card-foreground">
      {/* Total and Limit */}
      <div className="flex items-center space-x-2">
        <span className="font-bold select-none">Total: {total}</span>
        {!dataLimitDisable && total > dataLimit && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 select-none"
              >
                Limit {dataLimit}
                <ChevronDown className="w-4 h-4 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {[10, 20, 30, 40, 50]
                .filter((size) => size <= total)
                .map((size) => (
                  <DropdownMenuItem
                    key={size}
                    onClick={() => handleDataLimitChange(size)}
                    className="cursor-pointer"
                  >
                    {size}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Page Controls */}
      <div className="flex items-center space-x-2 select-none">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {getPageNumbers().map((number) => (
          <Button
            key={number}
            size="sm"
            variant={currentPage === number ? "default" : "outline"}
            onClick={() => handlePageChange(number)}
          >
            {number}
          </Button>
        ))}

        {currentPage < pageCount - 2 && <span className="mx-1">...</span>}

        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === pageCount}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(pageCount)}
          disabled={currentPage === pageCount}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default Pagination;

```

//=========================================

## Full Screen Icon

// =======================================

```js
"use client";

import { Button } from "@/components/ui/button";
import { Maximize, Minimize } from "lucide-react";

export type FullScreenTableType = {
  fullScreen?: boolean,
  setFullScreen?: (v: boolean) => void,
};

export default function FullScreenTable({
  fullScreen,
  setFullScreen,
}: FullScreenTableType) {
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => setFullScreen?.(!fullScreen)}
      aria-pressed={fullScreen}
      title={fullScreen ? "Exit fullscreen" : "Fullscreen"}
    >
      {fullScreen ? (
        <Minimize className="w-4 h-4" />
      ) : (
        <Maximize className="w-4 h-4" />
      )}
    </Button>
  );
}
```
