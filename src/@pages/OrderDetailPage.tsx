"use client";

import { currencyFormatter } from "@/utils/helper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import {
  useGetOrderQuery
} from "@/store/services/orderApi";
import { Screen } from "@/@core/layout";
import { useState } from "react";
import { OrderReadNested, OrderStatusEnum, OrderProductRead, PaymentStatusEnum } from "@/utils/modelTypes/orderType";
import { toast } from "sonner";
import { OrderInvoice } from "@/components/invoice/OrderInvoice";

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

export default function OrderDetailPage({ id }: { id: string }) {
  const { data, isLoading, error, refetch } = useGetOrderQuery(id);
  
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<OrderProductRead | null>(null);
  const [returnReason, setReturnReason] = useState("");
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [returnType, setReturnType] = useState<"full_order" | "single_product">("full_order");
  const [returnProductId, setReturnProductId] = useState<number | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [showViewReviewDialog, setShowViewReviewDialog] = useState(false);
  const [viewReviewData, setViewReviewData] = useState<any>(null);
  const [isLoadingReview, setIsLoadingReview] = useState(false);
  const [viewReviewProduct, setViewReviewProduct] = useState<OrderProductRead | null>(null);

  // View Return states
  const [showViewReturnDialog, setShowViewReturnDialog] = useState(false);
  const [viewReturnData, setViewReturnData] = useState<any>(null);
  const [isLoadingReturnView, setIsLoadingReturnView] = useState(false);
  const [viewReturnProduct, setViewReturnProduct] = useState<OrderProductRead | null>(null);

  if (isLoading) return <OrderSkeleton />;
  if (error)
    return <p className="text-center text-red-500">Failed to load order.</p>;

  const order: OrderReadNested = data?.data;

  // Check if order can be cancelled (until order status is not completed, cancelled, or refunded)
  const canCancelOrder = () => {
    return order.order_status !== OrderStatusEnum.CANCELLED &&
           order.order_status !== OrderStatusEnum.COMPLETED &&
           order.order_status !== OrderStatusEnum.REFUNDED;
  };

  // Check if order can be returned (completed/delivered orders)
  const canReturnOrder = () => {
    const completedStatuses = [OrderStatusEnum.COMPLETED, "delivered"];
    return completedStatuses.includes(order.order_status) &&
           order.payment_status !== PaymentStatusEnum.REVERSAL;
  };

  // Check if product can be reviewed
  const canReviewProduct = (orderProduct: OrderProductRead) => {
    if (order.order_status !== OrderStatusEnum.COMPLETED) return false;
    
    // Check if 15 days have passed since order completion
    const completedDate = order.order_status_history?.order_completed_date;
    if (completedDate) {
      const fifteenDaysAgo = new Date();
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
      return new Date(completedDate) > fifteenDaysAgo;
    }
    
    return false;
  };

  // Handle order cancellation
  const handleCancelOrder = async () => {
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

      const response = await fetch(getApiUrl(`/order/${order.id}/cancel`), {
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
        setCancelReason("");
        refetch();
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
  const handleReturnOrder = async () => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        toast.error("Authentication required");
        return;
      }

      const returnData: any = {
        order_id: order.id,
        return_type: returnType,
        reason: returnReason || "Customer requested return",
      };

      if (returnType === "single_product" && returnProductId) {
        // Find the order product to return
        const orderProduct = order.order_products.find(op => op.id === returnProductId);
        if (orderProduct) {
          returnData.items = [{
            order_item_id: orderProduct.id,
            quantity: parseInt(orderProduct.order_quantity),
            reason: returnReason
          }];
        }
      }

      const response = await fetch(getApiUrl('/returns/request'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(returnData),
      });
      
      if (response.ok) {
        toast.success("Return request created successfully");
        setShowReturnDialog(false);
        setReturnReason("");
        refetch();
      } else {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to create return request');
      }
    } catch (error) {
      console.error("Return error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create return request");
    }
  };

  // Handle review submission
  const handleReviewSubmit = async (reviewData: any) => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch(getApiUrl('/review/create'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(reviewData),
      });

      if (response.ok) {
        toast.success("Review submitted successfully");
        setShowReviewForm(false);
        setSelectedProduct(null);
        refetch();
      } else {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error("Review error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit review");
    }
  };

  // Handle viewing existing return
  const handleViewReturn = async (returnRequestId: number, product: OrderProductRead) => {
    try {
      setIsLoadingReturnView(true);
      setViewReturnProduct(product);
      setShowViewReturnDialog(true);

      const accessToken = getAccessToken();
      if (!accessToken) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch(getApiUrl(`returns/${returnRequestId}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setViewReturnData(result.data);
        } else {
          throw new Error(result.detail || 'Failed to fetch return details');
        }
      } else {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || 'Failed to fetch return details');
      }
    } catch (error) {
      console.error("View return error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to fetch return details");
      setShowViewReturnDialog(false);
    } finally {
      setIsLoadingReturnView(false);
    }
  };

  // Handle viewing existing review
  const handleViewReview = async (reviewId: number, product: OrderProductRead) => {
    try {
      setIsLoadingReview(true);
      setViewReviewProduct(product);
      setShowViewReviewDialog(true);

      const accessToken = getAccessToken();
      if (!accessToken) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch(getApiUrl(`/review/read/${reviewId}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setViewReviewData(result.data);
        } else {
          throw new Error(result.detail || 'Failed to fetch review');
        }
      } else {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || 'Failed to fetch review');
      }
    } catch (error) {
      console.error("View review error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to fetch review");
      setShowViewReviewDialog(false);
    } finally {
      setIsLoadingReview(false);
    }
  };

  // Helper function to get product image - prioritize variation image for variable products
  const getProductImage = (product: OrderProductRead) => {
    // ✅ First try variation image (for variable products)
    const variationImage = product.variation_snapshot?.image?.original ||
                          product.variation_snapshot?.image?.thumbnail ||
                          product.variation_data?.image?.original ||
                          product.variation_data?.image?.thumbnail;

    if (variationImage) return variationImage;

    // Fallback to product snapshot image
    return product.product_snapshot?.image?.thumbnail ||
           product.product_snapshot?.image?.original ||
           product.product_snapshot?.image ||
           product.product?.image?.thumbnail ||
           product.product?.image?.original ||
           product.product?.image ||
           "/placeholder.png";
  };

  // ✅ Helper function to get variation text
  const getVariationText = (product: OrderProductRead) => {
    if (product.variation_snapshot?.title) {
      return product.variation_snapshot.title;
    }
    if (product.variation_snapshot?.options) {
      return Object.entries(product.variation_snapshot.options)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
    }
    if (product.variation_data?.title) {
      return product.variation_data.title;
    }
    if (product.variation_data?.options) {
      return Object.entries(product.variation_data.options)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
    }
    return null;
  };

  // Helper function to get product name
  const getProductName = (product: OrderProductRead) => {
    return product.product_snapshot?.name || 
           product.product?.name || 
           "Unknown Product";
  };

  return (
    <Screen className="py-10">
      <Card className="shadow-lg border-border">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <div>
              <span className="text-2xl font-bold">Order #{order.tracking_number}</span>
              <p className="text-sm text-muted-foreground mt-1">
                Posted on {new Date(order.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="flex gap-2">
              {/* Cancel Order Button */}
              {canCancelOrder() && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowCancelDialog(true)}
                >
                  Cancel Order
                </Button>
              )}
              
              {/* Return Order Button */}
              {canReturnOrder() && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setReturnType("full_order");
                    setReturnProductId(null);
                    setShowReturnDialog(true);
                  }}
                >
                  Return Order
                </Button>
              )}
              
              <Badge variant="outline" className="capitalize text-sm">
                {order.order_status.replace("-", " ")}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Order Status Summary */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 text-center">
              <h4 className="font-semibold text-sm text-muted-foreground">Order</h4>
              <Badge className="capitalize mt-1">
                {order.order_status.replace("-", " ")}
              </Badge>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <h4 className="font-semibold text-sm text-muted-foreground">Payment</h4>
              <Badge className="capitalize mt-1">
                {order.payment_status?.replace("-", " ") || "Pending"}
              </Badge>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <h4 className="font-semibold text-sm text-muted-foreground">Delivery</h4>
              <Badge className="capitalize mt-1">
                {order?.shipping_type || "Standard Delivery"}
              </Badge>
            </div>
          </section>

          {/* Order Status Message */}
          <section className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-center italic">
              'Our order has been received and is being processed'
            </p>
          </section>

          {/* Order Status Timeline */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Order Timeline</h3>
            <div className="border rounded-lg p-6 space-y-4">
              {order.order_status_history ? (
                Object.entries(order.order_status_history)
                  .filter(([key, value]) => key.includes('_date') && value && key !== 'id' && key !== 'order_id' && key !== 'language')
                  .map(([key, value], index, array) => (
                    <div key={key} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${
                          index === array.length - 1 ? 'bg-green-500' : 'bg-blue-500'
                        }`}></div>
                        {index < array.length - 1 && (
                          <div className="w-0.5 h-8 bg-gray-300 mt-1"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <span className="capitalize font-medium block">
                          {key.replace('order_', '').replace('_date', '').replace(/_/g, ' ')}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(value).toLocaleDateString('en-PK', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="space-y-4">
                  {[
                    "Order Received",
                    "Processing", 
                    "Revised",
                    "Classification Center",
                    "All Local Facility",
                    "Out for Delivery",
                    "Delivered"
                  ].map((status, index) => (
                    <div key={status} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                        {index < 6 && (
                          <div className="w-0.5 h-8 bg-gray-300 mt-1"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <span className="capitalize font-medium block">{status}</span>
                        <span className="text-sm text-muted-foreground">
                          {index === 0 ? new Date(order.created_at).toLocaleDateString('en-PK', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : "Pending"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <Separator />

          {/* Product List */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Order Items</h3>
            <div className="space-y-6">
              {order.order_products.map((item: OrderProductRead, index: number) => {
                // Calculate pricing
                const quantity = parseInt(item.order_quantity, 10);
                const unitPrice = item.unit_price; // Regular price
                const salePrice = item.sale_price || 0; // Discounted price
                const hasDiscount = salePrice > 0 && salePrice < unitPrice;
                const priceToShow = hasDiscount ? salePrice : unitPrice;
                const discountPerItem = hasDiscount ? (unitPrice - salePrice) : 0;

                return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-6 border-b border-border pb-6"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-lg font-semibold w-6">{index + 1}.</span>
                    <div className="relative w-24 h-24 rounded overflow-hidden border bg-gray-100 flex items-center justify-center">
                      <Image
                        src={getProductImage(item)}
                        alt={getProductName(item)}
                        width={96}
                        height={96}
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.png";
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-lg">{getProductName(item)}</p>
                      {getVariationText(item) && (
                        <p className="text-sm text-primary font-medium">
                          {getVariationText(item)}
                        </p>
                      )}
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Quantity:</span>
                          <span className="font-medium">{parseInt(item.order_quantity, 10)}</span>
                        </div>
                        <div className="mt-1">
                          {hasDiscount ? (
                            <div>
                              <span className="text-gray-500 line-through text-sm mr-2">
                                {currencyFormatter(unitPrice)} each
                              </span>
                              <span className="text-green-600 font-medium">
                                {currencyFormatter(salePrice)} each
                              </span>
                              {discountPerItem > 0 && (
                                <p className="text-xs text-green-600 mt-1">
                                  Save {currencyFormatter(discountPerItem * quantity)}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="font-medium">{currencyFormatter(unitPrice)} each</span>
                          )}
                        </div>
                      </div>
                      <div className="mt-2">
                        {hasDiscount && (
                          <p className="text-sm text-gray-500 line-through">
                            {currencyFormatter(unitPrice * quantity)}
                          </p>
                        )}
                        <p className={`text-lg font-semibold ${hasDiscount ? 'text-green-600' : ''}`}>
                          Subtotal: {currencyFormatter(item.subtotal)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* View Review Button - Show if review already exists */}
                    {item.review_id && item.review_id > 0 ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-600 hover:bg-green-50"
                        onClick={() => handleViewReview(item.review_id!, item)}
                      >
                        View Review
                      </Button>
                    ) : (
                      /* Review Product Button - Show if no review and can review */
                      canReviewProduct(item) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedProduct(item);
                            setShowReviewForm(true);
                          }}
                        >
                          Add Review
                        </Button>
                      )
                    )}

                    {/* Return Single Product Button or View Return */}
                    {item.is_returned && item.return_request_id ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        onClick={() => handleViewReturn(item.return_request_id!, item)}
                      >
                        View Return
                      </Button>
                    ) : (
                      canReturnOrder() && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setReturnType("single_product");
                            setReturnProductId(item.id);
                            setShowReturnDialog(true);
                          }}
                        >
                          Return Item
                        </Button>
                      )
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          </section>

          <Separator />

          {/* Order Summary */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Total */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              <div className="space-y-3 max-w-md">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>
                    {currencyFormatter(order.order_products.reduce((acc: number, product: OrderProductRead) => {
                      return acc + (product.unit_price * parseInt(product.order_quantity, 10));
                    }, 0))}
                  </span>
                </div>

                {(() => {
                  const productDiscount = order.order_products.reduce((acc: number, product: OrderProductRead) => {
                    const salePrice = product.sale_price || 0;
                    if (salePrice > 0 && salePrice < product.unit_price) {
                      return acc + ((product.unit_price - salePrice) * parseInt(product.order_quantity, 10));
                    }
                    return acc;
                  }, 0);

                  const discountToShow = order.discount || productDiscount;

                  return discountToShow > 0 ? (
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span className="text-green-600">-{currencyFormatter(discountToShow)}</span>
                    </div>
                  ) : null;
                })()}

                {order.coupon_discount !== undefined && order.coupon_discount !== null && order.coupon_discount > 0 && (
                  <div className="flex justify-between">
                    <span>Coupon Discount:</span>
                    <span className="text-green-600">-{currencyFormatter(order.coupon_discount)}</span>
                  </div>
                )}

                {order.delivery_fee && order.delivery_fee > 0 && (
                  <div className="flex justify-between">
                    <span>Shipping Fee:</span>
                    <span>{currencyFormatter(order.delivery_fee)}</span>
                  </div>
                )}

                {order.sales_tax && order.sales_tax > 0 && (
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>{currencyFormatter(order.sales_tax)}</span>
                  </div>
                )}

                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>{currencyFormatter(order.paid_total || order.total)}</span>
                </div>

                {/* Return Entire Order Button */}
                {canReturnOrder() && (
                  <div className="pt-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setReturnType("full_order");
                        setReturnProductId(null);
                        setShowReturnDialog(true);
                      }}
                    >
                      Return Entire Order
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <p className="font-medium">{order.customer_name || "N/A"}</p>
                  <p>{order.shipping_address?.address || "N/A"}</p>
                  <p>
                    {order.shipping_address?.city || ""}, {order.shipping_address?.state || ""}
                  </p>
                  <p>{order.shipping_address?.zip || ""}</p>
                  <p className="mt-2">{order.customer_contact}</p>
                  {order.shipping_address?.email && (
                    <p>{order.shipping_address.email}</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Billing Address</h3>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <p className="font-medium">{order.customer_name || "N/A"}</p>
                  <p>{order.shipping_address?.address || "N/A"}</p>
                  <p>
                    {order.shipping_address?.city || ""}, {order.shipping_address?.state || ""}
                  </p>
                  <p>{order.shipping_address?.zip || ""}</p>
                </div>
              </div>

              {/* Fulfillment Officer Info */}
              {order.fullfillment_id && order.fullfillment_id > 0 && order.fullfillment_user_info && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Fulfillment Officer</h3>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center gap-3">
                      {order.fullfillment_user_info.avatar?.thumbnail || order.fullfillment_user_info.avatar?.original ? (
                        <img
                          src={order.fullfillment_user_info.avatar.thumbnail || order.fullfillment_user_info.avatar.original}
                          alt={order.fullfillment_user_info.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                          <span className="text-lg font-semibold text-primary">
                            {order.fullfillment_user_info.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{order.fullfillment_user_info.name}</p>
                        <p className="text-sm text-muted-foreground">{order.fullfillment_user_info.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          <Separator />

          {/* Invoice Section */}
          <section>
            <OrderInvoice
              orderData={order}
              formatCurrency={currencyFormatter}
              formatDate={(dateString: string | null) => {
                if (!dateString) return "Not yet";
                return new Date(dateString).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });
              }}
            />
          </section>
        </CardContent>
      </Card>

      {/* Cancel Order Dialog */}
      <CancelOrderDialog
        isOpen={showCancelDialog}
        onClose={() => {
          setShowCancelDialog(false);
          setCancelReason("");
          setNotifyCustomer(true);
        }}
        cancelReason={cancelReason}
        onReasonChange={setCancelReason}
        notifyCustomer={notifyCustomer}
        onNotifyChange={setNotifyCustomer}
        onSubmit={handleCancelOrder}
      />

      {/* Review Form Dialog - LARGER SIZE */}
      <ReviewFormDialog
        product={selectedProduct}
        orderId={order.id}
        isOpen={showReviewForm}
        onSubmit={handleReviewSubmit}
        onClose={() => {
          setShowReviewForm(false);
          setSelectedProduct(null);
        }}
      />

      {/* Return Dialog - LARGER SIZE */}
      <ReturnDialog
        isOpen={showReturnDialog}
        onClose={() => {
          setShowReturnDialog(false);
          setReturnReason("");
          setReturnProductId(null);
        }}
        returnType={returnType}
        returnReason={returnReason}
        onReasonChange={setReturnReason}
        onSubmit={handleReturnOrder}
        product={returnProductId ? order.order_products.find(op => op.id === returnProductId) : null}
      />

      {/* View Review Dialog */}
      <ViewReviewDialog
        isOpen={showViewReviewDialog}
        onClose={() => {
          setShowViewReviewDialog(false);
          setViewReviewData(null);
          setViewReviewProduct(null);
        }}
        reviewData={viewReviewData}
        product={viewReviewProduct}
        isLoading={isLoadingReview}
      />

      {/* View Return Dialog */}
      <ViewReturnDialog
        isOpen={showViewReturnDialog}
        onClose={() => {
          setShowViewReturnDialog(false);
          setViewReturnData(null);
          setViewReturnProduct(null);
        }}
        returnData={viewReturnData}
        product={viewReturnProduct}
        isLoading={isLoadingReturnView}
      />
    </Screen>
  );
}

// Cancel Order Dialog Component
interface CancelOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
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

// Review Form Component - LARGER SIZE
interface ReviewFormDialogProps {
  product: OrderProductRead | null;
  orderId: number;
  isOpen: boolean;
  onSubmit: (reviewData: any) => void;
  onClose: () => void;
}

function ReviewFormDialog({ product, orderId, isOpen, onSubmit, onClose }: ReviewFormDialogProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<Array<{ id: number; original: string; thumbnail: string }>>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Handle image upload to media/create API
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

      // Add all files to FormData with attribute name 'files'
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

        // Handle response - if single image use data[0], if multiple add all to photos
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

          // Add uploaded images to photos array (multi-dimensional array support)
          setPhotos(prev => [...prev, ...uploadedImages]);
          toast.success(`${uploadedImages.length} image(s) uploaded successfully`);
        }
      } else {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to upload images');
      }
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload images");
    } finally {
      setIsUploading(false);
      // Reset the input so same file can be selected again
      e.target.value = '';
    }
  };

  // Remove uploaded image from photos array
  const handleRemoveImage = (indexToRemove: number) => {
    setPhotos(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // Reset form when dialog closes
  const handleClose = () => {
    setRating(0);
    setComment("");
    setPhotos([]);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    onSubmit({
      order_id: orderId,
      product_id: product.product_id,
      shop_id: product.shop_id,
      rating,
      comment,
      variation_option_id: product.variation_option_id,
      photos: photos, // Multi-dimensional array of uploaded images
    });

    // Reset form after submission
    setRating(0);
    setComment("");
    setPhotos([]);
  };

  // ✅ Get correct image for variable products
  const getDialogProductImage = () => {
    const variationImage = product?.variation_snapshot?.image?.original ||
                          product?.variation_snapshot?.image?.thumbnail ||
                          product?.variation_data?.image?.original ||
                          product?.variation_data?.image?.thumbnail;
    return variationImage || product?.product_snapshot?.image?.thumbnail || "/placeholder.png";
  };

  // ✅ Get variation text
  const getDialogVariationText = () => {
    if (product?.variation_snapshot?.title) return product.variation_snapshot.title;
    if (product?.variation_snapshot?.options) {
      return Object.entries(product.variation_snapshot.options)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
    }
    if (product?.variation_data?.title) return product.variation_data.title;
    return null;
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Review Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
            <div className="relative w-16 h-16 rounded overflow-hidden border bg-white">
              <Image
                src={getDialogProductImage()}
                alt={product.product_snapshot?.name || "Product image"}
                width={64}
                height={64}
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.png";
                }}
              />
            </div>
            <div>
              <p className="font-medium text-lg">{product.product_snapshot?.name}</p>
              {getDialogVariationText() && (
                <p className="text-sm text-primary font-medium">
                  {getDialogVariationText()}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="block text-lg font-medium">Rating *</Label>
            <div className="flex space-x-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-4xl transition-all duration-200 ${
                    star <= rating
                      ? "text-yellow-500 scale-110"
                      : "text-gray-300 hover:text-yellow-400 hover:scale-105"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {rating === 0 ? "Select a rating" : `You rated this product ${rating} star${rating > 1 ? 's' : ''}`}
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="comment" className="block text-lg font-medium">
              Your Review
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full min-h-[120px] text-lg p-4"
              placeholder="Share your detailed experience with this product. What did you like or dislike? How was the quality?"
            />
            <p className="text-sm text-muted-foreground">
              Your review helps other customers make better decisions.
            </p>
          </div>

          {/* Product Image Upload Section */}
          <div className="space-y-3">
            <Label className="block text-lg font-medium">
              Upload Product Images
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              Share photos of the product you received. You can upload multiple images at once or one by one.
            </p>

            {/* Upload Input */}
            <div className="flex items-center gap-3">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={isUploading}
                className="flex-1"
                id="review-images"
              />
              {isUploading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </div>
              )}
            </div>

            {/* Image Preview Grid */}
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
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.png";
                          }}
                        />
                      </div>
                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove image"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="px-6 py-2 text-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={rating === 0 || isUploading}
              className="px-6 py-2 text-lg"
            >
              Submit Review
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Return Dialog Component - LARGER SIZE
interface ReturnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  returnType: "full_order" | "single_product";
  returnReason: string;
  onReasonChange: (reason: string) => void;
  onSubmit: () => void;
  product: OrderProductRead | any;
}

function ReturnDialog({
  isOpen,
  onClose,
  returnType,
  returnReason,
  onReasonChange,
  onSubmit,
  product
}: ReturnDialogProps) {
  // ✅ Get correct image for variable products
  const getReturnProductImage = () => {
    const variationImage = product?.variation_snapshot?.image?.original ||
                          product?.variation_snapshot?.image?.thumbnail ||
                          product?.variation_data?.image?.original ||
                          product?.variation_data?.image?.thumbnail;
    return variationImage || product?.product_snapshot?.image?.thumbnail || "/placeholder.png";
  };

  // ✅ Get variation text
  const getReturnVariationText = () => {
    if (product?.variation_snapshot?.title) return product.variation_snapshot.title;
    if (product?.variation_snapshot?.options) {
      return Object.entries(product.variation_snapshot.options)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
    }
    if (product?.variation_data?.title) return product.variation_data.title;
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {returnType === "full_order" ? "Return Entire Order" : "Return Product"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {returnType === "single_product" && product && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded overflow-hidden border bg-white">
                  <Image
                    src={getReturnProductImage()}
                    alt={product.product_snapshot?.name || "Product image"}
                    width={64}
                    height={64}
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.png";
                    }}
                  />
                </div>
                <div>
                  <p className="font-medium text-lg">{product.product_snapshot?.name}</p>
                  {getReturnVariationText() && (
                    <p className="text-sm text-primary font-medium">
                      {getReturnVariationText()}
                    </p>
                  )}
                  <p className="text-sm">Quantity: {product.order_quantity}</p>
                  <p className="text-sm font-medium">
                    Price: {currencyFormatter(product.subtotal)}
                  </p>
                </div>
              </div>
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
              placeholder="Please provide a detailed explanation for why you are returning this item. This helps us improve our products and services."
              required
            />
            <p className="text-sm text-muted-foreground">
              Please be specific about the reason for your return. Common reasons include: wrong size, damaged item, not as described, changed mind, etc.
            </p>
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
              onClick={onSubmit}
              disabled={!returnReason.trim()}
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

// View Review Dialog Component
interface ViewReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reviewData: any;
  product: OrderProductRead | null;
  isLoading: boolean;
}

function ViewReviewDialog({
  isOpen,
  onClose,
  reviewData,
  product,
  isLoading
}: ViewReviewDialogProps) {
  // Get correct image for variable products
  const getViewProductImage = () => {
    const variationImage = product?.variation_snapshot?.image?.original ||
                          product?.variation_snapshot?.image?.thumbnail ||
                          product?.variation_data?.image?.original ||
                          product?.variation_data?.image?.thumbnail;
    return variationImage || product?.product_snapshot?.image?.thumbnail || "/placeholder.png";
  };

  // Get variation text
  const getViewVariationText = () => {
    if (product?.variation_snapshot?.title) return product.variation_snapshot.title;
    if (product?.variation_snapshot?.options) {
      return Object.entries(product.variation_snapshot.options)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
    }
    if (product?.variation_data?.title) return product.variation_data.title;
    return null;
  };

  // Format date helper
  const formatReviewDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-2xl ${
              star <= rating ? "text-yellow-500" : "text-gray-300"
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Your Review</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-6">
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-center text-muted-foreground">Loading review...</p>
          </div>
        ) : reviewData ? (
          <div className="space-y-6">
            {/* Product Info */}
            {product && (
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
                <div className="relative w-16 h-16 rounded overflow-hidden border bg-white">
                  <Image
                    src={getViewProductImage()}
                    alt={product.product_snapshot?.name || "Product image"}
                    width={64}
                    height={64}
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.png";
                    }}
                  />
                </div>
                <div>
                  <p className="font-medium text-lg">{product.product_snapshot?.name}</p>
                  {getViewVariationText() && (
                    <p className="text-sm text-primary font-medium">
                      {getViewVariationText()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Rating */}
            <div className="space-y-2">
              <Label className="block text-lg font-medium">Rating</Label>
              <div className="flex items-center gap-3">
                {renderStars(reviewData.rating)}
                <span className="text-lg font-medium text-muted-foreground">
                  ({reviewData.rating}/5)
                </span>
              </div>
            </div>

            {/* Comment */}
            {reviewData.comment && (
              <div className="space-y-2">
                <Label className="block text-lg font-medium">Your Comment</Label>
                <div className="p-4 border rounded-lg bg-gray-50">
                  <p className="text-gray-700 whitespace-pre-wrap">{reviewData.comment}</p>
                </div>
              </div>
            )}

            {/* Photos */}
            {reviewData.photos && Object.keys(reviewData.photos).length > 0 && (
              <div className="space-y-2">
                <Label className="block text-lg font-medium">Photos</Label>
                <div className="grid grid-cols-4 gap-3">
                  {Array.isArray(reviewData.photos) ? (
                    reviewData.photos.map((photo: any, index: number) => (
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
                    ))
                  ) : (
                    Object.values(reviewData.photos).map((photo: any, index: number) => (
                      <div key={index} className="relative w-full aspect-square rounded-lg overflow-hidden border bg-gray-100">
                        <Image
                          src={typeof photo === 'string' ? photo : photo?.thumbnail || photo?.original}
                          alt={`Review photo ${index + 1}`}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.png";
                          }}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Review Date */}
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Reviewed on {formatReviewDate(reviewData.created_at)}
              </p>
              {reviewData.updated_at && (
                <p className="text-sm text-muted-foreground">
                  Last updated: {formatReviewDate(reviewData.updated_at)}
                </p>
              )}
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
          <div className="py-6 text-center text-muted-foreground">
            No review data available.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// View Return Dialog Component
interface ViewReturnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  returnData: any;
  product: OrderProductRead | null;
  isLoading: boolean;
}

function ViewReturnDialog({
  isOpen,
  onClose,
  returnData,
  product,
  isLoading
}: ViewReturnDialogProps) {
  // Get correct image for variable products
  const getViewProductImage = () => {
    const variationImage = product?.variation_snapshot?.image?.original ||
                          product?.variation_snapshot?.image?.thumbnail ||
                          product?.variation_data?.image?.original ||
                          product?.variation_data?.image?.thumbnail;
    return variationImage || product?.product_snapshot?.image?.thumbnail || "/placeholder.png";
  };

  // Get variation text
  const getViewVariationText = () => {
    if (product?.variation_snapshot?.title) return product.variation_snapshot.title;
    if (product?.variation_snapshot?.options) {
      return Object.entries(product.variation_snapshot.options)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
    }
    if (product?.variation_data?.title) return product.variation_data.title;
    return null;
  };

  // Format date helper
  const formatReturnDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge color
  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "default";
      case "pending":
        return "secondary";
      case "rejected":
        return "destructive";
      case "processed":
        return "default";
      default:
        return "outline";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Return Request Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-6">
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-center text-muted-foreground">Loading return details...</p>
          </div>
        ) : returnData ? (
          <div className="space-y-6">
            {/* Product Info */}
            {product && (
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
                <div className="relative w-16 h-16 rounded overflow-hidden border bg-white">
                  <Image
                    src={getViewProductImage()}
                    alt={product.product_snapshot?.name || "Product image"}
                    width={64}
                    height={64}
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.png";
                    }}
                  />
                </div>
                <div>
                  <p className="font-medium text-lg">{product.product_snapshot?.name}</p>
                  {getViewVariationText() && (
                    <p className="text-sm text-primary font-medium">
                      {getViewVariationText()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Return Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="block text-sm font-medium text-muted-foreground">Return Status</Label>
                <Badge variant={getStatusBadgeVariant(returnData.status)} className="capitalize">
                  {returnData.status}
                </Badge>
              </div>
              <div className="space-y-2">
                <Label className="block text-sm font-medium text-muted-foreground">Refund Status</Label>
                <Badge variant={getStatusBadgeVariant(returnData.refund_status)} className="capitalize">
                  {returnData.refund_status}
                </Badge>
              </div>
            </div>

            {/* Return Type */}
            <div className="space-y-2">
              <Label className="block text-sm font-medium text-muted-foreground">Return Type</Label>
              <p className="font-medium capitalize">{returnData.return_type?.replace(/_/g, " ")}</p>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label className="block text-sm font-medium text-muted-foreground">Reason</Label>
              <div className="p-4 border rounded-lg bg-gray-50">
                <p className="text-gray-700 whitespace-pre-wrap">{returnData.reason}</p>
              </div>
            </div>

            {/* Refund Amount */}
            <div className="space-y-2">
              <Label className="block text-sm font-medium text-muted-foreground">Refund Amount</Label>
              <p className="text-2xl font-bold text-green-600">
                {currencyFormatter(parseFloat(returnData.refund_amount))}
              </p>
            </div>

            {/* Transfer Eligible Date */}
            {returnData.transfer_eligible_at && (
              <div className="space-y-2">
                <Label className="block text-sm font-medium text-muted-foreground">Transfer Eligible At</Label>
                <p className="font-medium">{formatReturnDate(returnData.transfer_eligible_at)}</p>
              </div>
            )}

            {/* Admin Notes */}
            {returnData.admin_notes && (
              <div className="space-y-2">
                <Label className="block text-sm font-medium text-muted-foreground">Admin Notes</Label>
                <div className="p-4 border rounded-lg bg-blue-50">
                  <p className="text-blue-700">{returnData.admin_notes}</p>
                </div>
              </div>
            )}

            {/* Rejected Reason */}
            {returnData.rejected_reason && (
              <div className="space-y-2">
                <Label className="block text-sm font-medium text-muted-foreground">Rejected Reason</Label>
                <div className="p-4 border rounded-lg bg-red-50">
                  <p className="text-red-700">{returnData.rejected_reason}</p>
                </div>
              </div>
            )}

            {/* Return Request Date */}
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Return requested on {formatReturnDate(returnData.created_at)}
              </p>
              {returnData.updated_at && (
                <p className="text-sm text-muted-foreground">
                  Last updated: {formatReturnDate(returnData.updated_at)}
                </p>
              )}
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
          <div className="py-6 text-center text-muted-foreground">
            No return data available.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function OrderSkeleton() {
  return (
    <Screen className="py-10">
      <Card className="shadow-lg border-border p-6 space-y-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-40 w-full" />
      </Card>
    </Screen>
  );
}