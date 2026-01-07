"use client";

import { Screen } from "@/@core/layout";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { fetchApi } from "@/action/fetchApi";
import LayoutSkeleton from "@/components/loaders/LayoutSkeleton";
import Link from "next/link";
import { OrderInvoice } from "@/components/invoice/OrderInvoice";
import { currencyFormatter } from "@/utils/helper";
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

export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTrackingNumber = searchParams.get("tracking");

  const [orderData, setOrderData] = useState<OrderTrackingResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);

  useEffect(() => {
    // Debug: Log all localStorage keys related to PayFast
    console.log('=== ORDER SUCCESS PAGE DEBUG ===');
    console.log('URL tracking param:', urlTrackingNumber);

    if (typeof window !== 'undefined') {
      console.log('localStorage payfast_pending_tracking:', localStorage.getItem('payfast_pending_tracking'));
      console.log('localStorage payfast_pending_order_id:', localStorage.getItem('payfast_pending_order_id'));
    }

    // Check URL first, then localStorage (for PayFast redirect)
    let tracking = urlTrackingNumber;

    if (!tracking && typeof window !== 'undefined') {
      tracking = localStorage.getItem('payfast_pending_tracking');
      console.log('Tracking from localStorage:', tracking);
      if (tracking) {
        // Clean up localStorage after retrieving
        localStorage.removeItem('payfast_pending_tracking');
        localStorage.removeItem('payfast_pending_order_id');
        console.log('Cleaned up localStorage');
      }
    }

    console.log('Final tracking value:', tracking);
    console.log('================================');

    if (!tracking) {
      console.log('No tracking found - will show help message');
      setLoading(false);
      return;
    }

    setTrackingNumber(tracking);
  }, [urlTrackingNumber, router]);

  useEffect(() => {
    if (trackingNumber) {
      fetchOrderDetails();
    }
  }, [trackingNumber]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl(`/order/tracking/${trackingNumber}`));
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


  if (loading) {
    return (
      <Screen>
        <div className="flex justify-center items-center min-h-screen">
          <LayoutSkeleton />
        </div>
      </Screen>
    );
  }

  // Show special message when no tracking number is available (guest checkout after PayFast)
  if (!trackingNumber && !loading) {
    return (
      <Screen>
        <div className="pt-12 pb-20">
          <div className="container mx-auto px-4 max-w-2xl">
            {/* Success Header - Payment likely completed */}
            <div className="text-center mb-8">
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
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Payment Received!
              </h1>
              <p className="text-lg text-gray-600 mb-2">
                Your payment has been processed successfully.
              </p>
            </div>

            {/* Info Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">What happens next?</h2>
              <ul className="text-blue-800 space-y-2 text-sm">
                <li>• Your order has been created and is being processed</li>
                <li>• You will receive a confirmation email with your order details</li>
                <li>• You can track your order using the tracking number in the email</li>
              </ul>
            </div>

            {/* Track Order Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Track Your Order</h2>
              <p className="text-gray-600 mb-4">
                Enter your order tracking number to view your order status:
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const input = form.elements.namedItem('trackingInput') as HTMLInputElement;
                  if (input.value.trim()) {
                    router.push(`/order-success?tracking=${input.value.trim()}`);
                  }
                }}
                className="flex gap-2"
              >
                <input
                  name="trackingInput"
                  type="text"
                  placeholder="Enter tracking number"
                  className="flex-1 border rounded-lg px-4 py-2"
                />
                <Button type="submit">Track</Button>
              </form>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4">
              <Link href="/">
                <Button className="w-full" size="lg">
                  Continue Shopping
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="w-full" size="lg">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
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
              Order #: <span className="font-semibold text-primary">{orderData.tracking_number}</span>
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
                  <p className="text-gray-600 mt-1">Order #: {orderData.tracking_number}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{currencyFormatter(orderData.total)}</p>
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
                {orderData.order_products.map((product) => {
                  // ✅ Get variation image if available, otherwise use product image
                  const variationImage = product.variation_snapshot?.image?.original ||
                                        product.variation_data?.image?.original;
                  const productImage = product.product?.image?.original || "/placeholder-image.jpg";
                  const displayImage = variationImage || productImage;

                  // ✅ Get variation options text
                  const getVariationText = () => {
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

                  const variationText = getVariationText();

                  // Calculate pricing
                  // unit_price = regular/original price
                  // sale_price = discounted price (what customer pays)
                  // item_discount = unit_price - sale_price (per item)
                  const quantity = parseInt(product.order_quantity, 10);
                  const unitPrice = product.unit_price; // Regular price
                  const salePrice = product.sale_price || 0; // Discounted price
                  const hasDiscount = salePrice > 0 && salePrice < unitPrice;
                  const priceToShow = hasDiscount ? salePrice : unitPrice; // What customer actually pays
                  const discountPerItem = hasDiscount ? (unitPrice - salePrice) : 0;

                  return (
                    <div key={product.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      <Image
                        src={displayImage}
                        alt={product.product.name}
                        width={80}
                        height={80}
                        className="rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{product.product.name}</h4>
                        {/* ✅ Show variation options */}
                        {variationText && (
                          <p className="text-sm text-primary font-medium">{variationText}</p>
                        )}
                        {product.shop_name && (
                          <p className="text-sm text-gray-600">Sold by: {product.shop_name}</p>
                        )}
                        <div className="text-sm mt-1">
                          {hasDiscount ? (
                            <div>
                              <span className="text-gray-500 line-through mr-2">
                                Rs. {unitPrice} each
                              </span>
                              <span className="text-green-600 font-medium">
                                Rs. {salePrice} each
                              </span>
                              {discountPerItem > 0 && (
                                <p className="text-xs text-green-600">
                                  Save Rs. {discountPerItem * quantity}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-600">Rs. {unitPrice} each</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Quantity: {parseInt(product.order_quantity, 10)}</p>
                      </div>
                      <div className="text-right">
                        {hasDiscount && (
                          <p className="text-sm text-gray-500 line-through">
                            {currencyFormatter(unitPrice * quantity)}
                          </p>
                        )}
                        <p className={`font-semibold ${hasDiscount ? 'text-green-600' : 'text-gray-900'}`}>
                          {currencyFormatter(product.subtotal)}
                        </p>
                      </div>
                    </div>
                  );
                })}
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

            {/* Fulfillment Officer Info */}
            {orderData.fullfillment_id && orderData.fullfillment_id > 0 && orderData.fullfillment_user_info && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Fulfillment Officer</h3>
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

            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    {currencyFormatter(orderData.order_products.reduce((acc: number, product: any) => {
                      return acc + (product.unit_price * parseInt(product.order_quantity, 10));
                    }, 0))}
                  </span>
                </div>

                {(() => {
                  // Calculate total product discount
                  const productDiscount = orderData.order_products.reduce((acc: number, product: any) => {
                    const salePrice = product.sale_price || 0;
                    if (salePrice > 0 && salePrice < product.unit_price) {
                      return acc + ((product.unit_price - salePrice) * parseInt(product.order_quantity, 10));
                    }
                    return acc;
                  }, 0);

                  // Use discount from order OR calculated product discount (whichever is available)
                  const discountToShow = orderData.discount || productDiscount;

                  return (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span className="font-medium">-{currencyFormatter(discountToShow)}</span>
                    </div>
                  );
                })()}

                {orderData.coupon_discount !== undefined && orderData.coupon_discount !== null && orderData.coupon_discount>0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount</span>
                    <span className="font-medium">-{currencyFormatter(orderData.coupon_discount)}</span>
                  </div>
                )}
                {orderData.delivery_fee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping Fee</span>
                  <span className="font-medium">{currencyFormatter(orderData.delivery_fee || 0)}</span>
                </div>
                )}
                {orderData.sales_tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{currencyFormatter(orderData.sales_tax || 0)}</span>
                </div>
                )}
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{currencyFormatter(orderData.total)}</span>
                </div>
              </div>
            </div>

            {/* Invoice */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <OrderInvoice
                orderData={orderData}
                formatCurrency={currencyFormatter}
                formatDate={formatDate}
              />
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
