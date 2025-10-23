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
  const headerRef = useRef<HTMLDivElement | null>(null);

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
