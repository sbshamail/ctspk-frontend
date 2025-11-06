"use client";

import { Screen } from "@/@core/layout";
import Table from "@/components/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ColumnType } from "@/components/table/MainTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetOrdersQuery } from "@/store/services/orderApi";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { OrderReadNested, OrderStatusEnum, PaymentStatusEnum } from "@/utils/modelTypes/orderType";
import { toast } from "sonner";

export default function OrdersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, isFetching, refetch } = useGetOrdersQuery({
    page,
    limit,
    searchTerm,
  });

  const orders = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  // Check if order can be cancelled (until fullfillment_id is null)
  const canCancelOrder = (order: OrderReadNested) => {
    return order.fullfillment_id === null && 
           order.order_status !== OrderStatusEnum.CANCELLED &&
           order.order_status !== OrderStatusEnum.COMPLETED &&
           order.order_status !== OrderStatusEnum.REFUNDED;
  };

  // Check if order can be returned (completed/delivered orders)
  const canReturnOrder = (order: OrderReadNested) => {
    const completedStatuses = [OrderStatusEnum.COMPLETED, "delivered"];
    return completedStatuses.includes(order.order_status) &&
           order.payment_status !== PaymentStatusEnum.REVERSAL;
  };

  // Handle order cancellation
  const handleCancelOrder = async (orderId: number) => {
    try {
      // For now, we'll use a direct fetch until the mutation is properly set up
      const response = await fetch(`/api/order/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        toast.success("Order cancelled successfully");
        refetch(); // Refresh the orders list
      } else {
        throw new Error('Failed to cancel order');
      }
    } catch (error) {
      toast.error("Failed to cancel order");
      console.error("Cancellation error:", error);
    }
  };

  // Handle order return
  const handleReturnOrder = async (orderId: number) => {
    try {
      // For now, we'll use a direct fetch until the mutation is properly set up
      const response = await fetch('/api/returns/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderId,
          return_type: "full_order",
          reason: "Customer requested return",
          items: []
        }),
      });
      
      if (response.ok) {
        toast.success("Return request created successfully");
        refetch(); // Refresh the orders list
      } else {
        throw new Error('Failed to create return request');
      }
    } catch (error) {
      toast.error("Failed to create return request");
      console.error("Return error:", error);
    }
  };

  const columns: ColumnType<OrderReadNested>[] = [
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
          variant={cell === PaymentStatusEnum.PENDING ? "secondary" : "default"}
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
        <div className="flex gap-2">
          {/* Cancel Order Button */}
          {canCancelOrder(row) && (
            <Button
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("Are you sure you want to cancel this order?")) {
                  handleCancelOrder(row.id);
                }
              }}
            >
              Cancel
            </Button>
          )}
          
          {/* Return Order Button */}
          {canReturnOrder(row) && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("Are you sure you want to return this order?")) {
                  handleReturnOrder(row.id);
                }
              }}
            >
              Return
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/order/${row.id}`)}
          >
            View
          </Button>
        </div>
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
        <Table<OrderReadNested>
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