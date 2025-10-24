"use client";

import { currencyFormatter } from "@/utils/helper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { useGetOrderQuery } from "@/store/services/orderApi";
import { Screen } from "@/@core/layout";

export default function OrderDetailPage({ id }: { id: string }) {
  const { data, isLoading, error } = useGetOrderQuery(id);

  if (isLoading) return <OrderSkeleton />;
  if (error)
    return <p className="text-center text-red-500">Failed to load order.</p>;

  const order = data?.data;

  return (
    <Screen className="py-10">
      <Card className="shadow-lg border-border">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Order #{order.tracking_number}</span>
            <Badge variant="outline" className="capitalize">
              {order.order_status.replace("-", " ")}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Customer Info */}
          <section>
            <h3 className="text-lg font-semibold mb-2">Customer Information</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p>
                  <strong>Name:</strong> {order.customer_name}
                </p>
                <p>
                  <strong>Phone:</strong> {order.customer_contact}
                </p>
                <p>
                  <strong>Email:</strong> {order.shipping_address?.email}
                </p>
              </div>
              <div>
                <p>
                  <strong>Address:</strong> {order.shipping_address?.address}
                </p>
                <p>
                  {order.shipping_address?.city}, {order.shipping_address?.zip}
                </p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Product List */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Ordered Products</h3>
            <div className="space-y-4">
              {order.order_products.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 border-b border-border pb-4"
                >
                  <div className="relative w-20 h-20 rounded overflow-hidden border">
                    <Image
                      src={item.product?.image?.thumbnail || "/placeholder.png"}
                      alt={item.product?.name || ""}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.product?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.order_quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p>{currencyFormatter(item.unit_price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <Separator />

          {/* Summary */}
          <section className="text-right space-y-1">
            <p>
              Subtotal: <strong>{currencyFormatter(order.total || 0)}</strong>
            </p>
            <p>
              Admin Commission:{" "}
              <strong>
                {currencyFormatter(parseFloat(order.admin_commission_amount))}
              </strong>
            </p>
            <p className="text-lg font-semibold">
              Total Paid: {currencyFormatter(order.paid_total || order.total)}
            </p>
          </section>
        </CardContent>
      </Card>
    </Screen>
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
