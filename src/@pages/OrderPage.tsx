"use client";

import { Screen } from "@/@core/layout";
import Table from "@/components/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ColumnType } from "@/components/table/MainTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetOrdersQuery } from "@/store/services/orderApi";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { OrderReadNested, OrderStatusEnum, PaymentStatusEnum } from "@/utils/modelTypes/orderType";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parse } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Star } from "lucide-react";
import { isReviewEnabled } from "@/lib/useSettings";
import { getOrderStatusLabel } from "@/utils/helper";

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
  const [globalFilter, setGlobalFilter] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string | null>(null);

  // Cancel dialog states
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderReadNested | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [notifyCustomer, setNotifyCustomer] = useState(true);

  // Return dialog states
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [selectedReturnOrder, setSelectedReturnOrder] = useState<OrderReadNested | null>(null);
  const [returnReason, setReturnReason] = useState("");

  // Review dialog states
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [selectedReviewOrder, setSelectedReviewOrder] = useState<OrderReadNested | null>(null);
  const [showReviews, setShowReviews] = useState(true);

  // Build dateRange for API (fromDate/toDate are in yyyy-MM-dd format from InputDateField)
  const dateRange = useMemo(() => {
    if (fromDate && toDate) {
      // Convert yyyy-MM-dd to dd-MM-yyyy for API
      const fromFormatted = format(parse(fromDate, "yyyy-MM-dd", new Date()), "dd-MM-yyyy");
      const toFormatted = format(parse(toDate, "yyyy-MM-dd", new Date()), "dd-MM-yyyy");
      return ["created_at", fromFormatted, toFormatted] as [string, string, string];
    }
    return undefined;
  }, [fromDate, toDate]);

  // Build columnFilters for order status
  const columnFilters = useMemo(() => {
    if (orderStatusFilter) {
      return [["order_status", orderStatusFilter]] as [string, string | number | boolean][];
    }
    return undefined;
  }, [orderStatusFilter]);

  const { data, isLoading, isFetching, refetch } = useGetOrdersQuery({
    page,
    limit,
    searchTerm: globalFilter || undefined,
    dateRange,
    columnFilters,
  });

  const orders = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  // Check if order can be cancelled (until order status is not completed, cancelled, or refunded)
  const canCancelOrder = (order: OrderReadNested) => {
    return order.order_status !== OrderStatusEnum.CANCELLED &&
           order.order_status !== OrderStatusEnum.COMPLETED &&
           order.order_status !== OrderStatusEnum.REFUNDED;
  };

  // Check if order can be returned (completed/delivered orders)
  const canReturnOrder = (order: OrderReadNested) => {
    const completedStatuses = [OrderStatusEnum.COMPLETED, "delivered"];
    return completedStatuses.includes(order.order_status) &&
           order.payment_status !== PaymentStatusEnum.REVERSAL;
  };

  // Check if order can be reviewed (completed orders only)
  const canReviewOrder = (order: OrderReadNested) => {
    return order.order_status === OrderStatusEnum.COMPLETED;
  };

  // Open review dialog
  const openReviewDialog = (order: OrderReadNested) => {
    setSelectedReviewOrder(order);
    setShowReviewDialog(true);
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
  const handleReturnOrder = async (photos: Array<{ id: number; original: string; thumbnail: string }>) => {
    if (!selectedReturnOrder) return;

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
          order_id: selectedReturnOrder.id,
          return_type: "full_order",
          reason: returnReason || "Customer requested return",
          photos: photos,
          items: []
        }),
      });

      if (response.ok) {
        toast.success("Return request created successfully");
        setShowReturnDialog(false);
        setSelectedReturnOrder(null);
        setReturnReason("");
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

  // Open return dialog
  const openReturnDialog = (order: OrderReadNested) => {
    setSelectedReturnOrder(order);
    setShowReturnDialog(true);
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
    {
      title: "Order #",
      accessor: "tracking_number",
      render: ({ cell, row }) => {
        return (
          <div className="space-y-1">
            <Link
              href={`/order/${row.id}`}
              className="text-primary hover:underline font-medium text-sm"
            >
              {cell}
            </Link>
          </div>
        );
      },
    },
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
          className="text-xs font-medium px-2 py-0.5"
        >
          {getOrderStatusLabel(cell)}
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
          {/* Cancel Order Button - Only show when order is not completed, cancelled, or refunded */}
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
                openReturnDialog(row);
              }}
            >
              Return
            </Button>
          )}

          {/* Review Order Button - Only show for completed orders */}
          {showReviews && canReviewOrder(row) && (
            <Button
              variant="outline"
              size="sm"
              className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
              onClick={(e) => {
                e.stopPropagation();
                openReviewDialog(row);
              }}
            >
              {row.order_review_id && row.order_review_id > 0 ? 'View Review' : 'Review'}
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

  // Order status options for filter
  const orderStatusOptions = [
    { value: "all", label: "All Statuses" },
    { value: OrderStatusEnum.PENDING, label: "Pending" },
    { value: OrderStatusEnum.PROCESSING, label: "Processing" },
    { value: OrderStatusEnum.PACKED, label: "Packed" },
    { value: OrderStatusEnum.AT_DISTRIBUTION_CENTER, label: "At Distribution Center" },
    { value: OrderStatusEnum.AT_LOCAL_FACILITY, label: "At Local Facility" },
    { value: OrderStatusEnum.OUT_FOR_DELIVERY, label: "Out for Delivery" },
    { value: OrderStatusEnum.COMPLETED, label: "Completed" },
    { value: OrderStatusEnum.CANCELLED, label: "Cancelled" },
    { value: OrderStatusEnum.REFUNDED, label: "Refunded" },
  ];

  return (
    <Screen className="py-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-semibold">My Orders</h1>

        {/* Order Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filter by Status:</span>
          <Select
            value={orderStatusFilter || "all"}
            onValueChange={(value) => {
              setOrderStatusFilter(value === "all" ? null : value);
              setPage(1); // Reset to first page when filter changes
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              {orderStatusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
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

      {/* Return Order Dialog */}
      <ReturnOrderDialog
        isOpen={showReturnDialog}
        onClose={() => {
          setShowReturnDialog(false);
          setSelectedReturnOrder(null);
          setReturnReason("");
        }}
        order={selectedReturnOrder}
        returnReason={returnReason}
        onReasonChange={setReturnReason}
        onSubmit={handleReturnOrder}
      />

      {/* Order Review Dialog */}
      <OrderReviewDialog
        isOpen={showReviewDialog}
        onClose={() => {
          setShowReviewDialog(false);
          setSelectedReviewOrder(null);
        }}
        order={selectedReviewOrder}
        onSuccess={() => {
          refetch();
        }}
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

const CANCEL_REASONS = [
  "Changed mind or no longer needed",
  "Long delivery or pickup time vs expectations",
  "Missed delivery/pickup window",
  "Duplicate orders placed accidentally",
  "Pricing & Cost Concerns",
  "Quality & Freshness Concerns (Pre-Delivery)",
  "Address or Availability Mistakes",
  "Others"
];

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
  const [selectedReason, setSelectedReason] = useState("");

  const handleReasonSelect = (value: string) => {
    setSelectedReason(value);
    if (value !== "Others") {
      onReasonChange(value);
    } else {
      onReasonChange("");
    }
  };

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
              <p><strong>Order #:</strong> {order.tracking_number}</p>
              <p><strong>Customer:</strong> {order.customer_name}</p>
              <p><strong>Total:</strong> Rs. {Math.round(order.total || 0)}</p>
              <p><strong>Status:</strong> {getOrderStatusLabel(order.order_status)}</p>
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
            <Label htmlFor="cancel-reason-select" className="block text-lg font-medium">
              Reason for Cancellation *
            </Label>
            <Select value={selectedReason} onValueChange={handleReasonSelect}>
              <SelectTrigger className="w-full text-lg p-4">
                <SelectValue placeholder="Select a reason for cancellation" />
              </SelectTrigger>
              <SelectContent>
                {CANCEL_REASONS.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedReason === "Others" && (
            <div className="space-y-3">
              <Label htmlFor="cancel-reason-text" className="block text-lg font-medium">
                Please specify your reason
              </Label>
              <Textarea
                id="cancel-reason-text"
                value={cancelReason}
                onChange={(e) => onReasonChange(e.target.value)}
                className="w-full min-h-[120px] text-lg p-4"
                placeholder="Please provide a detailed reason for cancelling this order. This helps us improve our services."
                required
              />
            </div>
          )}
          
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

// Return Order Dialog Component
interface ReturnOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderReadNested | null;
  returnReason: string;
  onReasonChange: (reason: string) => void;
  onSubmit: (photos: Array<{ id: number; original: string; thumbnail: string }>) => void;
}

function ReturnOrderDialog({
  isOpen,
  onClose,
  order,
  returnReason,
  onReasonChange,
  onSubmit
}: ReturnOrderDialogProps) {
  const [photos, setPhotos] = useState<Array<{ id: number; original: string; thumbnail: string }>>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Reset photos when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setPhotos([]);
    }
  }, [isOpen]);

  // Handle single image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const accessToken = getAccessToken();
    if (!accessToken) {
      toast.error("Authentication required");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('files', file);

      const response = await fetch(getApiUrl('/media/create?thumbnail=true'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          const uploadedImage = Array.isArray(result.data)
            ? {
                id: result.data[0].id,
                original: result.data[0].original || result.data[0].url,
                thumbnail: result.data[0].thumbnail || result.data[0].original || result.data[0].url
              }
            : {
                id: result.data.id,
                original: result.data.original || result.data.url,
                thumbnail: result.data.thumbnail || result.data.original || result.data.url
              };

          setPhotos(prev => [...prev, uploadedImage]);
          toast.success("Image uploaded successfully");
        }
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Remove uploaded image
  const handleRemoveImage = (indexToRemove: number) => {
    setPhotos(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = () => {
    onSubmit(photos);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Return Entire Order</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {order && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium mb-2">Order Details</h4>
              <p><strong>Order #:</strong> {order.tracking_number}</p>
              <p><strong>Customer:</strong> {order.customer_name}</p>
              <p><strong>Total:</strong> Rs. {Math.round(order.total || 0)}</p>
              <p><strong>Status:</strong> {getOrderStatusLabel(order.order_status)}</p>
            </div>
          )}

          <div className="space-y-3">
            <Label htmlFor="return-reason" className="block text-lg font-medium">
              Reason for Return *
            </Label>
            <Textarea
              id="return-reason"
              value={returnReason}
              onChange={(e) => onReasonChange(e.target.value)}
              className="w-full min-h-[120px] text-lg p-4"
              placeholder="Please provide a detailed explanation for why you are returning this order. This helps us improve our products and services."
              required
            />
            <p className="text-sm text-muted-foreground">
              Please be specific about the reason for your return. Common reasons include: wrong size, damaged item, not as described, changed mind, etc.
            </p>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-3">
            <Label className="block text-lg font-medium">
              Upload Photos (Optional)
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              Upload photos one by one to support your return request
            </p>
            <div className="flex items-center gap-3">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="flex-1"
              />
              {isUploading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </div>
              )}
            </div>

            {/* Image Preview */}
            {photos.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">
                  Uploaded Images ({photos.length})
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {photos.map((photo, index) => (
                    <div key={photo.id || index} className="relative group">
                      <div className="relative w-full aspect-square rounded-lg overflow-hidden border bg-gray-100">
                        <Image
                          src={photo.thumbnail || photo.original}
                          alt={`Return image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Return Policy</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Returns are accepted within 30 days of delivery</li>
              <li>• Items must be in original condition with tags attached</li>
              <li>• Refunds will be processed to your original payment method</li>
              <li>• Return shipping may be free depending on the reason</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-6 py-2 text-lg"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!returnReason.trim() || isUploading}
              className="px-6 py-2 text-lg"
            >
              Submit Return Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Order Review Dialog Component
interface OrderReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderReadNested | null;
  onSuccess: () => void;
}

function OrderReviewDialog({
  isOpen,
  onClose,
  order,
  onSuccess
}: OrderReviewDialogProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [existingReview, setExistingReview] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<Array<{ id: number; original: string; thumbnail: string }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch existing review when dialog opens
  useEffect(() => {
    if (isOpen && order) {
      fetchExistingReview();
    } else {
      // Reset states when dialog closes
      setExistingReview(null);
      setRating(0);
      setComment("");
      setPhotos([]);
      setIsLoading(true);
    }
  }, [isOpen, order?.id]);

  const fetchExistingReview = async () => {
    if (!order) return;

    // Check if order has a review (order_review_id > 0)
    if (!order.order_review_id || order.order_review_id <= 0) {
      // No review exists - show the form
      setExistingReview(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const accessToken = getAccessToken();
      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      // Call the correct API endpoint for fetching existing review
      const response = await fetch(getApiUrl(`/order-review/order/${order.id}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setExistingReview(result.data);
        } else {
          setExistingReview(null);
        }
      } else {
        // No review exists - show the form
        setExistingReview(null);
      }
    } catch (error) {
      console.error("Error fetching review:", error);
      setExistingReview(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const accessToken = getAccessToken();
    if (!accessToken) {
      toast.error("Authentication required");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      const response = await fetch(getApiUrl('/media/create?thumbnail=true'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          const uploadedImages = Array.isArray(result.data)
            ? result.data.map((img: any) => ({
                id: img.id,
                original: img.original || img.url,
                thumbnail: img.thumbnail || img.original || img.url
              }))
            : [{
                id: result.data.id,
                original: result.data.original || result.data.url,
                thumbnail: result.data.thumbnail || result.data.original || result.data.url
              }];

          setPhotos(prev => [...prev, ...uploadedImages]);
          toast.success(`${uploadedImages.length} image(s) uploaded successfully`);
        }
      } else {
        throw new Error('Failed to upload images');
      }
    } catch (error) {
      toast.error("Failed to upload images");
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Remove uploaded image
  const handleRemoveImage = (indexToRemove: number) => {
    setPhotos(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // Submit review
  const handleSubmitReview = async () => {
    if (!order || rating === 0) return;

    try {
      setIsSubmitting(true);
      const accessToken = getAccessToken();
      if (!accessToken) {
        toast.error("Authentication required");
        return;
      }

      const reviewData = {
        order_id: order.id,
        rating,
        comment,
        photos: photos,
      };

      const response = await fetch(getApiUrl('/order-review/create'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(reviewData),
      });

      if (response.ok) {
        toast.success("Review submitted successfully");
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || errorData?.detail || 'Failed to submit review');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render star rating
  const renderStars = (ratingValue: number, interactive: boolean = false) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setRating(star)}
            className={`transition-all duration-200 ${
              interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
            }`}
          >
            <Star
              className={`w-8 h-8 ${
                star <= ratingValue
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {existingReview ? 'Your Review' : 'Write a Review'}
          </DialogTitle>
        </DialogHeader>

        {/* Order Info */}
        <div className="border rounded-lg p-4 bg-gray-50 mb-4">
          <h4 className="font-medium mb-2">Order Details</h4>
          <p><strong>Order #:</strong> {order.tracking_number}</p>
          <p><strong>Total:</strong> Rs. {Math.round(order.total || 0)}</p>
          <p><strong>Date:</strong> {formatDate(order.created_at)}</p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        ) : existingReview ? (
          // Show existing review
          <div className="space-y-6">
            {/* Rating */}
            <div className="space-y-2">
              <Label className="block text-lg font-medium">Your Rating</Label>
              <div className="flex items-center gap-3">
                {renderStars(existingReview.rating)}
                <span className="text-lg font-medium text-muted-foreground">
                  ({existingReview.rating}/5)
                </span>
              </div>
            </div>

            {/* Comment */}
            {existingReview.comment && (
              <div className="space-y-2">
                <Label className="block text-lg font-medium">Your Comment</Label>
                <div className="p-4 border rounded-lg bg-white">
                  <p className="text-gray-700 whitespace-pre-wrap">{existingReview.comment}</p>
                </div>
              </div>
            )}

            {/* Photos */}
            {existingReview.photos && existingReview.photos.length > 0 && (
              <div className="space-y-2">
                <Label className="block text-lg font-medium">Photos</Label>
                <div className="grid grid-cols-4 gap-3">
                  {existingReview.photos.map((photo: any, index: number) => (
                    <div key={index} className="relative w-full aspect-square rounded-lg overflow-hidden border bg-gray-100">
                      <Image
                        src={photo.thumbnail || photo.original || photo}
                        alt={`Review photo ${index + 1}`}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.png";
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Review Date */}
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Reviewed on {formatDate(existingReview.created_at)}
              </p>
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="px-6 py-2 text-lg"
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          // Show review form
          <div className="space-y-6">
            {/* Rating - Always shown for order reviews */}
            <div className="space-y-3">
              <Label className="block text-lg font-medium">Rating *</Label>
              {renderStars(rating, true)}
              <p className="text-sm text-muted-foreground">
                {rating === 0 ? "Click to rate your experience" : `You rated ${rating} star${rating > 1 ? 's' : ''}`}
              </p>
            </div>

            {/* Comment */}
            <div className="space-y-3">
              <Label htmlFor="review-comment" className="block text-lg font-medium">
                Your Review
              </Label>
              <Textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full min-h-[120px] text-lg p-4"
                placeholder="Share your experience with this order. What did you like? Any suggestions for improvement?"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-3">
              <Label className="block text-lg font-medium">
                Upload Photos (Optional)
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="flex-1"
                />
                {isUploading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </div>
                )}
              </div>

              {/* Image Preview */}
              {photos.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">
                    Uploaded Images ({photos.length})
                  </p>
                  <div className="grid grid-cols-4 gap-3">
                    {photos.map((photo, index) => (
                      <div key={photo.id || index} className="relative group">
                        <div className="relative w-full aspect-square rounded-lg overflow-hidden border bg-gray-100">
                          <Image
                            src={photo.thumbnail || photo.original}
                            alt={`Uploaded image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="px-6 py-2 text-lg"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmitReview}
                disabled={rating === 0 || isSubmitting || isUploading}
                className="px-6 py-2 text-lg"
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}