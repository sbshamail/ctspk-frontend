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
import { useState, useEffect } from "react";
import { OrderReadNested, OrderStatusEnum, PaymentStatusEnum } from "@/utils/modelTypes/orderType";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

// Helper function to get access token from cookies
const getAccessToken = () => {
  if (typeof document === 'undefined') return '';
  
  const cookies = document.cookie.split(';');
  const accessTokenCookie = cookies.find(cookie => cookie.trim().startsWith('access_token='));
  
  if (accessTokenCookie) {
    return accessTokenCookie.split('=')[1]?.trim() || '';
  }
  
  return '';
};

// Helper function to get API URL
const getApiUrl = (endpoint: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  // Remove trailing slash from baseUrl and leading slash from endpoint if needed
  const formattedBaseUrl = baseUrl.replace(/\/$/, '');
  const formattedEndpoint = endpoint.replace(/^\//, '');
  return `${formattedBaseUrl}/${formattedEndpoint}`;
};

export default function OrdersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Cancel dialog states
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderReadNested | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [notifyCustomer, setNotifyCustomer] = useState(true);

  // Use useEffect to reset page when search term changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const { data, isLoading, isFetching, refetch } = useGetOrdersQuery({
    page,
    limit,
    searchTerm,
  });

  const orders = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  // Check if order can be cancelled (until fulfillment_id is null)
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
      const accessToken = getAccessToken();
      if (!accessToken) {
        toast.error("Authentication required");
        return;
      }

      const cancelData = {
        reason: cancelReason || "my order is not deliver yet. so i don't want to get this product any more",
        notify_customer: notifyCustomer
      };

      const response = await fetch(getApiUrl(`/order/${orderId}/cancel`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(cancelData),
      });
      
      if (response.ok) {
        toast.success("Order cancelled successfully");
        setShowCancelDialog(false);
        setSelectedOrder(null);
        setCancelReason("");
        setNotifyCustomer(true);
        refetch(); // Refresh the orders list
      } else {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error("Cancellation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to cancel order");
    }
  };

  // Handle order return
  const handleReturnOrder = async (orderId: number) => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch(getApiUrl('/returns/request'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
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
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to create return request');
      }
    } catch (error) {
      console.error("Return error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create return request");
    }
  };

  // Open cancel dialog
  const openCancelDialog = (order: OrderReadNested) => {
    setSelectedOrder(order);
    setShowCancelDialog(true);
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
          {cell?.replace(/-/g, " ") || "Unknown"}
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
          {cell?.replace(/-/g, " ") || "Unknown"}
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
          hour: "2-digit",
          minute: "2-digit"
        }),
    },
    {
      title: "Actions",
      render: ({ row }) => (
        <div className="flex gap-2">
          {/* Cancel Order Button - Only show when fulfillment_id is null */}
          {canCancelOrder(row) && (
            <Button
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                openCancelDialog(row);
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

  // Sort orders by date in descending order (newest first)
  const sortedOrders = [...orders].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

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
          data={sortedOrders}
          columns={columns}
          isLoading={isFetching}
          striped={true}
          dataLimit={limit}
          setDataLimit={setLimit}
          total={total}
          currentPage={page}
          setCurrentPage={setPage}
          showPagination={true}
          //totalPages={totalPages}
        />
      )}

      {/* Cancel Order Dialog */}
      <CancelOrderDialog
        isOpen={showCancelDialog}
        onClose={() => {
          setShowCancelDialog(false);
          setSelectedOrder(null);
          setCancelReason("");
          setNotifyCustomer(true);
        }}
        order={selectedOrder}
        cancelReason={cancelReason}
        onReasonChange={setCancelReason}
        notifyCustomer={notifyCustomer}
        onNotifyChange={setNotifyCustomer}
        onSubmit={() => selectedOrder && handleCancelOrder(selectedOrder.id)}
      />
    </Screen>
  );
}

// Cancel Order Dialog Component
interface CancelOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderReadNested | null;
  cancelReason: string;
  onReasonChange: (reason: string) => void;
  notifyCustomer: boolean;
  onNotifyChange: (notify: boolean) => void;
  onSubmit: () => void;
}

function CancelOrderDialog({ 
  isOpen, 
  onClose, 
  order,
  cancelReason, 
  onReasonChange, 
  notifyCustomer, 
  onNotifyChange,
  onSubmit 
}: CancelOrderDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Cancel Order</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {order && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium mb-2">Order Details</h4>
              <p><strong>Tracking #:</strong> {order.tracking_number}</p>
              <p><strong>Customer:</strong> {order.customer_name}</p>
              <p><strong>Total:</strong> {order.total} PKR</p>
              <p><strong>Status:</strong> {order.order_status}</p>
              <p><strong>Fulfillment ID:</strong> {order.fullfillment_id || "Not assigned"}</p>
            </div>
          )}
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">Important Notice</h4>
            <p className="text-sm text-yellow-700">
              Are you sure you want to cancel this order? This action cannot be undone. 
              If the order has already been processed, you may need to contact customer support.
            </p>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="cancel-reason" className="block text-lg font-medium">
              Reason for Cancellation *
            </Label>
            <Textarea
              id="cancel-reason"
              value={cancelReason}
              onChange={(e) => onReasonChange(e.target.value)}
              className="w-full min-h-[120px] text-lg p-4"
              placeholder="Please provide a detailed reason for cancelling this order. This helps us improve our services."
              required
            />
            <p className="text-sm text-muted-foreground">
              Default reason: "my order is not deliver yet. so i don't want to get this product any more"
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Checkbox
              id="notify-customer"
              checked={notifyCustomer}
              onCheckedChange={(checked) => onNotifyChange(checked as boolean)}
            />
            <Label htmlFor="notify-customer" className="text-lg">
              Notify customer about cancellation
            </Label>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="px-6 py-2 text-lg"
            >
              Keep Order
            </Button>
            <Button 
              type="button" 
              onClick={onSubmit}
              disabled={!cancelReason.trim()}
              variant="destructive"
              className="px-6 py-2 text-lg"
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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