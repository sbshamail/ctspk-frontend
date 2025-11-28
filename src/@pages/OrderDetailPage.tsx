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

  if (isLoading) return <OrderSkeleton />;
  if (error)
    return <p className="text-center text-red-500">Failed to load order.</p>;

  const order: OrderReadNested = data?.data;

  // Check if order can be cancelled (until fullfillment_id is null)
  const canCancelOrder = () => {
    return order.fullfillment_id === null && 
           order.order_status !== OrderStatusEnum.CANCELLED &&
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
                const quantity = parseFloat(item.order_quantity);
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
                          <span className="font-medium">{item.order_quantity}</span>
                        </div>
                        <div className="mt-1">
                          {hasDiscount ? (
                            <div>
                              <span className="text-gray-500 line-through text-sm mr-2">
                                Rs {unitPrice} each
                              </span>
                              <span className="text-green-600 font-medium">
                                Rs {salePrice} each
                              </span>
                              {discountPerItem > 0 && (
                                <p className="text-xs text-green-600 mt-1">
                                  Save Rs {discountPerItem * quantity}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="font-medium">Rs {unitPrice} each</span>
                          )}
                        </div>
                      </div>
                      <div className="mt-2">
                        {hasDiscount && (
                          <p className="text-sm text-gray-500 line-through">
                            Rs {(unitPrice * quantity).toLocaleString()}
                          </p>
                        )}
                        <p className={`text-lg font-semibold ${hasDiscount ? 'text-green-600' : ''}`}>
                          Subtotal: Rs {item.subtotal.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Review Product Button */}
                    {canReviewProduct(item) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedProduct(item);
                          setShowReviewForm(true);
                        }}
                      >
                        Review
                      </Button>
                    )}
                    
                    {/* Return Single Product Button */}
                    {canReturnOrder() && (
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
                    Rs {order.order_products.reduce((acc: number, product: OrderProductRead) => {
                      return acc + (product.unit_price * parseFloat(product.order_quantity));
                    }, 0).toLocaleString()}
                  </span>
                </div>

                {(() => {
                  const productDiscount = order.order_products.reduce((acc: number, product: OrderProductRead) => {
                    const salePrice = product.sale_price || 0;
                    if (salePrice > 0 && salePrice < product.unit_price) {
                      return acc + ((product.unit_price - salePrice) * parseFloat(product.order_quantity));
                    }
                    return acc;
                  }, 0);

                  const discountToShow = order.discount || productDiscount;

                  return discountToShow > 0 ? (
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span className="text-green-600">-Rs {discountToShow.toLocaleString()}</span>
                    </div>
                  ) : null;
                })()}

                {order.coupon_discount !== undefined && order.coupon_discount !== null && order.coupon_discount > 0 && (
                  <div className="flex justify-between">
                    <span>Coupon Discount:</span>
                    <span className="text-green-600">-Rs {order.coupon_discount.toLocaleString()}</span>
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

function CancelOrderDialog({ 
  isOpen, 
  onClose, 
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
    });
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
    <Dialog open={isOpen} onOpenChange={onClose}>
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
              type="submit" 
              disabled={rating === 0}
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