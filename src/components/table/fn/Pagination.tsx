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
