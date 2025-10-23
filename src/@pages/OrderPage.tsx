"use client";

import { Screen } from "@/@core/layout";
import Table from "@/components/table";
import { ColumnType } from "@/components/table/MainTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetOrdersQuery } from "@/store/services/orderApi";
import { useRouter } from "next/navigation";
import { useState } from "react";

type OrderType = {
  id: number;
  tracking_number: string;
  customer_name: string;
  customer_contact: string;
  total: number;
  order_status: string;
  payment_status: string;
  created_at: string;
};

export default function OrdersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, isFetching } = useGetOrdersQuery({
    page,
    limit,
    searchTerm,
  });

  const orders = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

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
    {
      title: "Order Status",
      accessor: "order_status",
      render: ({ cell }) => (
        <Badge
          variant="outline"
          className="capitalize text-xs font-medium px-2 py-0.5"
        >
          {cell.replace("-", " ")}
        </Badge>
      ),
    },
    {
      title: "Payment",
      accessor: "payment_status",
      render: ({ cell }) => (
        <Badge
          variant={cell === "payment-pending" ? "secondary" : "default"}
          className="capitalize text-xs font-medium px-2 py-0.5"
        >
          {cell.replace("-", " ")}
        </Badge>
      ),
    },
    {
      title: "Date",
      accessor: "created_at",
      render: ({ cell }) =>
        new Date(cell).toLocaleDateString("en-PK", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
    {
      title: "Actions",
      render: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/order/${row.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <Screen className="py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search customer or tracking..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Button onClick={() => setPage(1)}>Search</Button>
        </div>
      </div>

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

      {/* Pagination */}
      {/* <div className="flex justify-between items-center pt-4">
        <p className="text-sm text-muted-foreground">
          Showing page {page} of {totalPages} ({total} total)
        </p>
        <div className="space-x-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div> */}
    </Screen>
  );
}

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
