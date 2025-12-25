"use client";

import { Screen } from "@/@core/layout";
import { BreadcrumbSimple } from "@/components/breadCrumb/BreadcrumbSimple";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LayoutSkeleton from "@/components/loaders/LayoutSkeleton";
import Image from "next/image";
import { useState, useEffect } from "react";
import { OrderInvoice } from "@/components/invoice/OrderInvoice";
import { currencyFormatter } from "@/utils/helper";
import { useSearchParams } from "next/navigation";

const breadcrumbData = [
  { link: "/", name: "Home" },
  { link: "/track-order", name: "Track Order" },
];
const getApiUrl = (endpoint: string) => {
const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  // Remove trailing slash from baseUrl and leading slash from endpoint if needed
  const formattedBaseUrl = baseUrl.replace(/\/$/, '');
  const formattedEndpoint = endpoint.replace(/^\//, '');
  return `${formattedBaseUrl}/${formattedEndpoint}`;
};
interface OrderTrackingResponse {
  success: number;
  detail: string;
  data: {
    created_at: string;
    updated_at: string | null;
    id: number;
    tracking_number: string;
    customer_id: number;
    customer_contact: string;
    customer_name: string;
    amount: number;
    sales_tax: number;
    paid_total: number;
    total: number;
    cancelled_amount: string;
    admin_commission_amount: string;
    language: string;
    coupon_id: number | null;
    discount: number;
    coupon_discount?: number;
    payment_gateway: string;
    shipping_address: {
      country: string;
      city: string;
      state: string;
      area: string;
      zip_code: string;
      street: string;
    };
    billing_address: {
      country: string;
      city: string;
      state: string;
      area: string;
      zip_code: string;
      street: string;
    };
    logistics_provider: number;
    delivery_fee: number;
    delivery_time: string;
    order_status: string;
    payment_status: string;
    fullfillment_id: number | null;
    fullfillment_user_info?: {
      id: number;
      name: string;
      email: string;
      avatar?: {
        original?: string;
        thumbnail?: string;
        id?: number | null;
      };
    };
    assign_date: string | null;
    shops: any[];
    shop_count: number;
    order_products: Array<{
      created_at: string;
      updated_at: string | null;
      id: number;
      order_id: number;
      product_id: number;
      product: {
        image: {
          id: number;
          filename: string;
          extension: string;
          original: string;
          size_mb: number;
          thumbnail: string;
          media_type: string;
        };
        name: string;
      };
      variation_option_id: number | null;
      order_quantity: string;
      unit_price: number;
      subtotal: number;
      sale_price?: number;
      item_discount?: number;
      item_tax?: number;
      admin_commission: string;
      item_type: string;
      variation_data: any;
      product_snapshot: any;
      variation_snapshot: any;
      shop_id: number | null;
      shop_name: string | null;
      shop_slug: string | null;
    }>;
    order_status_history: {
      created_at: string;
      updated_at: string | null;
      id: number;
      order_id: number;
      language: string;
      order_pending_date: string | null;
      order_processing_date: string | null;
      order_completed_date: string | null;
      order_refunded_date: string | null;
      order_failed_date: string | null;
      order_cancelled_date: string | null;
      order_at_local_facility_date: string | null;
      order_out_for_delivery_date: string | null;
      order_packed_date: string | null;
      order_at_distribution_center_date: string | null;
    };
  };
}

const TrackOrderPage = () => {
  const searchParams = useSearchParams();
  const trackingFromUrl = searchParams.get("tracking");

  const [trackingNumber, setTrackingNumber] = useState(trackingFromUrl || "");
  const [orderData, setOrderData] = useState<OrderTrackingResponse["data"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-fetch order if tracking number is in URL
  useEffect(() => {
    if (trackingFromUrl && !orderData) {
      fetchOrder(trackingFromUrl);
    }
  }, [trackingFromUrl]);

  const fetchOrder = async (tracking: string) => {
    if (!tracking.trim()) {
      setError("Please enter a tracking number");
      return;
    }

    setLoading(true);
    setError("");
    setOrderData(null);

    try {
      const response = await fetch(getApiUrl(`/order/tracking/${tracking.trim()}`));
      const data: OrderTrackingResponse = await response.json();

      if (data.success === 1) {
        setOrderData(data.data);
      } else {
        setError("Order not found. Please check your tracking number.");
      }
    } catch (err) {
      setError("Failed to track order. Please try again.");
      console.error("Tracking error:", err);
    } finally {
      setLoading(false);
    }
  };

  const trackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(trackingNumber);
  };

  const getOrderStatusInfo = (status: string) => {
    const statusMap: { [key: string]: { label: string; color: string; description: string } } = {
      "order-pending": {
        label: "Order Pending",
        color: "bg-yellow-500",
        description: "Your order has been received and is being processed"
      },
      "order-processing": {
        label: "Processing",
        color: "bg-blue-500",
        description: "Your order is being prepared for shipment"
      },
      "order-packed": {
        label: "Packed",
        color: "bg-blue-600",
        description: "Your order has been packed and ready for shipment"
      },
      "order-at-distribution-center": {
        label: "At Distribution Center",
        color: "bg-purple-500",
        description: "Your order is at our distribution center"
      },
      "order-at-local-facility": {
        label: "At Local Facility",
        color: "bg-purple-600",
        description: "Your order has arrived at your local facility"
      },
      "order-out-for-delivery": {
        label: "Out for Delivery",
        color: "bg-green-500",
        description: "Your order is out for delivery today"
      },
      "order-completed": {
        label: "Delivered",
        color: "bg-green-600",
        description: "Your order has been delivered"
      },
      "order-cancelled": {
        label: "Cancelled",
        color: "bg-red-500",
        description: "Your order has been cancelled"
      },
      "order-failed": {
        label: "Failed",
        color: "bg-red-600",
        description: "Delivery failed"
      },
      "order-refunded": {
        label: "Refunded",
        color: "bg-gray-500",
        description: "Your order has been refunded"
      }
    };

    return statusMap[status] || {
      label: status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      color: "bg-gray-500",
      description: "Tracking your order status"
    };
  };

  const getPaymentStatusInfo = (status: string) => {
    const statusMap: { [key: string]: { label: string; color: string } } = {
      "payment-pending": { label: "Payment Pending", color: "bg-yellow-500" },
      "payment-processing": { label: "Processing", color: "bg-blue-500" },
      "payment-completed": { label: "Paid", color: "bg-green-500" },
      "payment-failed": { label: "Failed", color: "bg-red-500" },
      "payment-refunded": { label: "Refunded", color: "bg-gray-500" }
    };

    return statusMap[status] || { label: status, color: "bg-gray-500" };
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not yet";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Screen>
        <BreadcrumbSimple data={breadcrumbData} className="py-6" />
        <LayoutSkeleton />
      </Screen>
    );
  }

  return (
    <Screen>
      <BreadcrumbSimple data={breadcrumbData} className="py-6" />
      
      <div className="pt-12">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Track Your Order</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Enter your tracking number to get real-time updates on your order status
            </p>
          </div>

          {/* Tracking Input Form */}
          <div className="max-w-2xl mx-auto mb-12">
            <form onSubmit={trackOrder} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="mb-6">
                <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Tracking Number
                </label>
                <div className="flex gap-4">
                  <Input
                    type="text"
                    id="trackingNumber"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter your tracking number (e.g., TRK-D0DFAED67B56)"
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="bg-primary text-white hover:bg-primary-dark px-8"
                  >
                    {loading ? "Tracking..." : "Track Order"}
                  </Button>
                </div>
                {error && (
                  <p className="text-red-600 text-sm mt-2">{error}</p>
                )}
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Can't find your tracking number?{" "}
                  <a href="/contact" className="text-primary hover:underline">
                    Contact Support
                  </a>
                </p>
              </div>
            </form>
          </div>

          {/* Order Details */}
          {orderData && (
            <div className="max-w-6xl mx-auto space-y-8">
              {/* Order Summary Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Order #{orderData.tracking_number}</h2>
                    <p className="text-gray-600">
                      Placed on {formatDate(orderData.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 mt-4 lg:mt-0">
                    <div className="text-center sm:text-right">
                      <div className="text-sm text-gray-600">Total Amount</div>
                      <div className="font-bold text-lg text-gray-900">{currencyFormatter(orderData.total)}</div>
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getOrderStatusInfo(orderData.order_status).color}`}></div>
                    <span className="font-medium text-gray-900">Order: </span>
                    <span className="text-gray-600">{getOrderStatusInfo(orderData.order_status).label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getPaymentStatusInfo(orderData.payment_status).color}`}></div>
                    <span className="font-medium text-gray-900">Payment: </span>
                    <span className="text-gray-600">{getPaymentStatusInfo(orderData.payment_status).label}</span>
                  </div>
                  {orderData.payment_gateway && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className="font-medium text-gray-900">Payment Method: </span>
                      <span className="text-gray-600 capitalize">{orderData.payment_gateway.replace(/_/g, " ")}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="font-medium text-gray-900">Delivery: </span>
                    <span className="text-gray-600">{orderData.delivery_time}</span>
                  </div>
                </div>

                {/* Status Description */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">
                    {getOrderStatusInfo(orderData.order_status).description}
                  </p>
                </div>
              </div>

              {/* Order Timeline */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Order Timeline</h3>
                <div className="space-y-6">
                  {[
                    { 
                      key: 'order_pending_date', 
                      label: 'Order Received', 
                      date: orderData.order_status_history.order_pending_date 
                    },
                    { 
                      key: 'order_processing_date', 
                      label: 'Processing', 
                      date: orderData.order_status_history.order_processing_date 
                    },
                    { 
                      key: 'order_packed_date', 
                      label: 'Packed', 
                      date: orderData.order_status_history.order_packed_date 
                    },
                    { 
                      key: 'order_at_distribution_center_date', 
                      label: 'At Distribution Center', 
                      date: orderData.order_status_history.order_at_distribution_center_date 
                    },
                    { 
                      key: 'order_at_local_facility_date', 
                      label: 'At Local Facility', 
                      date: orderData.order_status_history.order_at_local_facility_date 
                    },
                    { 
                      key: 'order_out_for_delivery_date', 
                      label: 'Out for Delivery', 
                      date: orderData.order_status_history.order_out_for_delivery_date 
                    },
                    {
                      key: 'order_completed_date',
                      label: 'Completed',
                      date: orderData.order_status_history.order_completed_date
                    }
                  ].map((step, index) => (
                    <div key={step.key} className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        step.date ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className={`font-medium ${
                              step.date ? 'text-gray-900' : 'text-gray-400'
                            }`}>
                              {step.label}
                            </h4>
                            <p className={`text-sm ${
                              step.date ? 'text-gray-600' : 'text-gray-400'
                            }`}>
                              {formatDate(step.date)}
                            </p>
                          </div>
                          {step.date && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              Completed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Order Items</h3>
                <div className="space-y-4">
                  {orderData.order_products.map((item) => {
                    // ✅ Get variation image if available, otherwise use product image
                    const variationImage = item.variation_snapshot?.image?.original ||
                                          item.variation_snapshot?.image?.thumbnail ||
                                          item.variation_data?.image?.original ||
                                          item.variation_data?.image?.thumbnail;
                    const productImage = item.product?.image?.thumbnail || item.product?.image?.original;
                    const displayImage = variationImage || productImage;

                    // ✅ Get variation options text
                    const getVariationText = () => {
                      if (item.variation_snapshot?.title) {
                        return item.variation_snapshot.title;
                      }
                      if (item.variation_snapshot?.options) {
                        return Object.entries(item.variation_snapshot.options)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(", ");
                      }
                      if (item.variation_data?.title) {
                        return item.variation_data.title;
                      }
                      if (item.variation_data?.options) {
                        return Object.entries(item.variation_data.options)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(", ");
                      }
                      return null;
                    };

                    const variationText = getVariationText();

                    // Calculate pricing
                    const quantity = parseInt(item.order_quantity, 10);
                    const unitPrice = item.unit_price; // Regular price
                    const salePrice = item.sale_price || 0; // Discounted price
                    const hasDiscount = salePrice > 0 && salePrice < unitPrice;
                    const priceToShow = hasDiscount ? salePrice : unitPrice;
                    const discountPerItem = hasDiscount ? (unitPrice - salePrice) : 0;

                    return (
                      <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {displayImage ? (
                            <Image
                              src={displayImage}
                              alt={item.product.name}
                              width={64}
                              height={64}
                              className="object-cover"
                            />
                          ) : (
                            <span className="text-gray-400 text-xs">No image</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                          {variationText && (
                            <p className="text-sm text-primary font-medium">{variationText}</p>
                          )}
                          <div className="text-sm mt-1">
                            {hasDiscount ? (
                              <div>
                                <span className="text-gray-500 line-through mr-2">
                                  {currencyFormatter(unitPrice)} each
                                </span>
                                <span className="text-green-600 font-medium">
                                  {currencyFormatter(salePrice)} each
                                </span>
                                {discountPerItem > 0 && (
                                  <p className="text-xs text-green-600">
                                    Save {currencyFormatter(discountPerItem * quantity)}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-600">{currencyFormatter(unitPrice)} each</span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mt-1">Quantity: {parseInt(item.order_quantity, 10)}</p>
                        </div>
                        <div className="text-right">
                          {hasDiscount && (
                            <p className="text-sm text-gray-500 line-through">
                              {currencyFormatter(unitPrice * quantity)}
                            </p>
                          )}
                          <p className={`font-semibold ${hasDiscount ? 'text-green-600' : 'text-gray-900'}`}>
                            {currencyFormatter(item.subtotal)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Order Summary */}
                <div className="border-t border-gray-200 mt-6 pt-6">
                  <div className="max-w-md ml-auto space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900">
                        {currencyFormatter(orderData.order_products.reduce((acc: number, product: any) => {
                          return acc + (product.unit_price * parseInt(product.order_quantity, 10));
                        }, 0))}
                      </span>
                    </div>

                    {(() => {
                      const productDiscount = orderData.order_products.reduce((acc: number, product: any) => {
                        const salePrice = product.sale_price || 0;
                        if (salePrice > 0 && salePrice < product.unit_price) {
                          return acc + ((product.unit_price - salePrice) * parseInt(product.order_quantity, 10));
                        }
                        return acc;
                      }, 0);

                      const discountToShow = orderData.discount || productDiscount;

                      return discountToShow > 0 ? (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Discount</span>
                          <span className="text-green-600">-{currencyFormatter(discountToShow)}</span>
                        </div>
                      ) : null;
                    })()}

                    {orderData.coupon_discount !== undefined && orderData.coupon_discount !== null  && orderData.coupon_discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Coupon Discount</span>
                        <span className="text-green-600">-{currencyFormatter(orderData.coupon_discount)}</span>
                      </div>
                    )}

                    {orderData.delivery_fee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping Fee</span>
                        <span className="text-gray-900">{currencyFormatter(orderData.delivery_fee)}</span>
                      </div>
                    )}

                    {orderData.sales_tax > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax</span>
                        <span className="text-gray-900">{currencyFormatter(orderData.sales_tax)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-gray-200 pt-2">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="font-bold text-lg text-gray-900">{currencyFormatter(orderData.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Shipping Address</h3>
                  <div className="text-gray-600 space-y-1">
                    <p>{orderData.customer_name}</p>
                    <p>{orderData.shipping_address.street}</p>
                    <p>{orderData.shipping_address.area}</p>
                    <p>{orderData.shipping_address.city}, {orderData.shipping_address.state}</p>
                    <p>{orderData.shipping_address.country} - {orderData.shipping_address.zip_code}</p>
                    <p className="mt-2">📞 {orderData.customer_contact}</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Billing Address</h3>
                  <div className="text-gray-600 space-y-1">
                    <p>{orderData.customer_name}</p>
                    <p>{orderData.billing_address.street}</p>
                    <p>{orderData.billing_address.area}</p>
                    <p>{orderData.billing_address.city}, {orderData.billing_address.state}</p>
                    <p>{orderData.billing_address.country} - {orderData.billing_address.zip_code}</p>
                  </div>
                </div>
              </div>

              {/* Fulfillment Officer Info */}
              {orderData.fullfillment_id && orderData.fullfillment_id > 0 && orderData.fullfillment_user_info && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Fulfillment Officer</h3>
                  <div className="flex items-center gap-4">
                    {orderData.fullfillment_user_info.avatar?.thumbnail || orderData.fullfillment_user_info.avatar?.original ? (
                      <img
                        src={orderData.fullfillment_user_info.avatar.thumbnail || orderData.fullfillment_user_info.avatar.original}
                        alt={orderData.fullfillment_user_info.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                        <span className="text-2xl font-semibold text-primary">
                          {orderData.fullfillment_user_info.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">{orderData.fullfillment_user_info.name}</p>
                      <p className="text-gray-600 text-sm">{orderData.fullfillment_user_info.email}</p>
                      <p className="text-xs text-gray-500 mt-1">Your assigned fulfillment officer</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Invoice Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <OrderInvoice
                  orderData={orderData}
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
              </div>

              {/* Need Help Section */}
              <div className="bg-gray-50 rounded-2xl p-8 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Need Help With Your Order?</h3>
                <p className="text-gray-600 mb-6">
                  Our customer support team is here to help you with any questions about your order.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-primary text-white hover:bg-primary-dark">
                    Contact Support
                  </Button>
                  <Button variant="outline">
                    View Order Details
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Screen>
  );
};

export default TrackOrderPage;