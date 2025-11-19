"use client";

import { Screen } from "@/@core/layout";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { fetchApi } from "@/action/fetchApi";
import LayoutSkeleton from "@/components/loaders/LayoutSkeleton";
import Link from "next/link";

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
    payment_gateway: string;
    shipping_address: {
      country: string;
      city: string;
      state: string;
      zip_code: string;
      street: string;
    };
    billing_address: {
      country: string;
      city: string;
      state: string;
      zip_code: string;
      street: string;
    };
    logistics_provider: number;
    delivery_fee: number;
    delivery_time: string;
    order_status: string;
    payment_status: string;
    fullfillment_id: number | null;
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

export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trackingNumber = searchParams.get("tracking");

  const [orderData, setOrderData] = useState<OrderTrackingResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!trackingNumber) {
      router.push("/");
      return;
    }

    fetchOrderDetails();
  }, [trackingNumber]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://api.ctspk.com/api/order/tracking/${trackingNumber}`);
      const data: OrderTrackingResponse = await response.json();

      if (data.success === 1) {
        setOrderData(data.data);
      } else {
        setError("Order not found");
      }
    } catch (err) {
      console.error("Failed to fetch order:", err);
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
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

  const formatCurrency = (amount: number) => {
    return `Rs ${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <Screen>
        <div className="flex justify-center items-center min-h-screen">
          <LayoutSkeleton />
        </div>
      </Screen>
    );
  }

  if (error || !orderData) {
    return (
      <Screen>
        <div className="flex flex-col justify-center items-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600 mb-6">{error || "Order not found"}</p>
            <Link href="/">
              <Button>Go to Home</Button>
            </Link>
          </div>
        </div>
      </Screen>
    );
  }

  const orderStatusInfo = getOrderStatusInfo(orderData.order_status);
  const paymentStatusInfo = getPaymentStatusInfo(orderData.payment_status);

  return (
    <Screen>
      <div className="pt-12 pb-20">
        <div className="container mx-auto px-4">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 p-6 rounded-full">
                <svg
                  className="w-16 h-16 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Thank You for Your Purchase!
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-2">
              Your order has been successfully placed
            </p>
            <p className="text-lg text-gray-500">
              Order Number: <span className="font-semibold text-primary">{orderData.tracking_number}</span>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              We've sent a confirmation email to your registered email address
            </p>
          </div>

          {/* Continue Shopping Button */}
          <div className="flex justify-center mb-8">
            <Link href="/">
              <Button size="lg" className="px-8">
                Continue Shopping
              </Button>
            </Link>
          </div>

          {/* Order Details - Same as Track Order Page */}
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Order Summary Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                  <p className="text-gray-600 mt-1">Tracking Number: {orderData.tracking_number}</p>
                  <p className="text-sm text-gray-500">Placed on {formatDate(orderData.created_at)}</p>
                </div>
                <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-3">
                  <span className={`${orderStatusInfo.color} text-white px-4 py-2 rounded-full text-sm font-medium`}>
                    {orderStatusInfo.label}
                  </span>
                  <span className={`${paymentStatusInfo.color} text-white px-4 py-2 rounded-full text-sm font-medium`}>
                    {paymentStatusInfo.label}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(orderData.total)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Items</p>
                  <p className="text-2xl font-bold text-gray-900">{orderData.order_products.length}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Delivery Time</p>
                  <p className="text-lg font-semibold text-gray-900">{orderData.delivery_time || "Standard"}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {orderData.payment_gateway ? orderData.payment_gateway.replace(/_/g, " ") : "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Status Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Order Status Timeline</h3>
              <div className="space-y-4">
                {orderData.order_status_history.order_pending_date && (
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-4"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Order Pending</p>
                      <p className="text-sm text-gray-600">{formatDate(orderData.order_status_history.order_pending_date)}</p>
                    </div>
                  </div>
                )}
                {orderData.order_status_history.order_processing_date && (
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-4"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Processing</p>
                      <p className="text-sm text-gray-600">{formatDate(orderData.order_status_history.order_processing_date)}</p>
                    </div>
                  </div>
                )}
                {orderData.order_status_history.order_packed_date && (
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-4"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Packed</p>
                      <p className="text-sm text-gray-600">{formatDate(orderData.order_status_history.order_packed_date)}</p>
                    </div>
                  </div>
                )}
                {orderData.order_status_history.order_out_for_delivery_date && (
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-4"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Out for Delivery</p>
                      <p className="text-sm text-gray-600">{formatDate(orderData.order_status_history.order_out_for_delivery_date)}</p>
                    </div>
                  </div>
                )}
                {orderData.order_status_history.order_completed_date && (
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-600 rounded-full mr-4"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Delivered</p>
                      <p className="text-sm text-gray-600">{formatDate(orderData.order_status_history.order_completed_date)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Products */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Order Items</h3>
              <div className="space-y-4">
                {orderData.order_products.map((product) => (
                  <div key={product.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <Image
                      src={product.product.image.original}
                      alt={product.product.name}
                      width={80}
                      height={80}
                      className="rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{product.product.name}</h4>
                      {product.shop_name && (
                        <p className="text-sm text-gray-600">Sold by: {product.shop_name}</p>
                      )}
                      <p className="text-sm text-gray-600">Quantity: {product.order_quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(product.subtotal)}</p>
                      <p className="text-sm text-gray-600">{formatCurrency(product.unit_price)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Billing Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Shipping Address</h3>
                <div className="text-gray-600">
                  <p>{orderData.shipping_address.street}</p>
                  <p>{orderData.shipping_address.city}, {orderData.shipping_address.state}</p>
                  <p>{orderData.shipping_address.zip_code}</p>
                  <p>{orderData.shipping_address.country}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Billing Address</h3>
                <div className="text-gray-600">
                  <p>{orderData.billing_address.street}</p>
                  <p>{orderData.billing_address.city}, {orderData.billing_address.state}</p>
                  <p>{orderData.billing_address.zip_code}</p>
                  <p>{orderData.billing_address.country}</p>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(orderData.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">{formatCurrency(orderData.delivery_fee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{formatCurrency(orderData.sales_tax)}</span>
                </div>
                {orderData.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">-{formatCurrency(orderData.discount)}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(orderData.total)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Continue Shopping
                </Button>
              </Link>
              <Link href="/my-orders">
                <Button size="lg" className="w-full sm:w-auto">
                  View All Orders
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Screen>
  );
}
