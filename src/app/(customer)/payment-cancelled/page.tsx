"use client";

import { Screen } from "@/@core/layout";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchApi } from "@/action/fetchApi";
import LayoutSkeleton from "@/components/loaders/LayoutSkeleton";
import Link from "next/link";
import { currencyFormatter } from "@/utils/helper";
import { AlertCircle, RefreshCw, ShoppingBag } from "lucide-react";

const getApiUrl = (endpoint: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const formattedBaseUrl = baseUrl.replace(/\/$/, '');
  const formattedEndpoint = endpoint.replace(/^\//, '');
  return `${formattedBaseUrl}/${formattedEndpoint}`;
};

interface OrderData {
  id: number;
  tracking_number: string;
  total: number;
  payment_status: string;
  order_status: string;
  payment_gateway: string;
}

export default function PaymentCancelledPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trackingNumber = searchParams.get("tracking");

  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (trackingNumber) {
      fetchOrderDetails();
    } else {
      setLoading(false);
    }
  }, [trackingNumber]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl(`/order/tracking/${trackingNumber}`));
      const data = await response.json();

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

  if (loading) {
    return (
      <Screen>
        <div className="flex justify-center items-center min-h-screen">
          <LayoutSkeleton />
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <div className="pt-12 pb-20">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Warning Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="bg-yellow-100 p-6 rounded-full">
                <AlertCircle className="w-16 h-16 text-yellow-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Payment Cancelled
            </h1>
            <p className="text-lg text-gray-600">
              Your payment was cancelled or could not be completed.
            </p>
          </div>

          {/* Order Info */}
          {orderData && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Your Order</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-medium">{orderData.tracking_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-medium">{currencyFormatter(orderData.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    Pending
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Info Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              <strong>Note:</strong> Your order has been created but payment is pending.
              You can complete the payment from your orders page, or the order will be
              automatically cancelled if payment is not received.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4">
            {orderData && (
              <Link href={`/my-orders`}>
                <Button className="w-full" size="lg">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  View My Orders
                </Button>
              </Link>
            )}
            <Link href="/">
              <Button variant="outline" className="w-full" size="lg">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>

          {/* No tracking number */}
          {!trackingNumber && (
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                No order information available.
              </p>
              <Link href="/">
                <Button>Go to Home</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </Screen>
  );
}
