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
