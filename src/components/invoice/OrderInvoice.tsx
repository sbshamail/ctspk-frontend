"use client";

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import Image from "next/image";

interface InvoiceProps {
  orderData: any;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string | null) => string;
}

export function OrderInvoice({ orderData, formatCurrency, formatDate }: InvoiceProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (invoiceRef.current) {
      const printContent = invoiceRef.current.innerHTML;
      const originalContent = document.body.innerHTML;

      document.body.innerHTML = printContent;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload(); // Reload to restore React state
    }
  };

  // Calculate totals
  // unit_price = regular/original price
  // sale_price = discounted price (what customer pays)
  const calculateSubtotal = () => {
    return orderData.order_products.reduce((acc: number, product: any) => {
      return acc + (product.unit_price * parseFloat(product.order_quantity));
    }, 0);
  };

  const calculateProductDiscount = () => {
    return orderData.order_products.reduce((acc: number, product: any) => {
      const salePrice = product.sale_price || 0;
      if (salePrice > 0 && salePrice < product.unit_price) {
        return acc + ((product.unit_price - salePrice) * parseFloat(product.order_quantity));
      }
      return acc;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const productDiscount = calculateProductDiscount();
  const discount = orderData.discount || productDiscount;
  const couponDiscount = orderData.coupon_discount || 0;
  const tax = orderData.sales_tax || 0;
  const shipping = orderData.delivery_fee || 0;

  return (
    <div>
      <Button onClick={handlePrint} className="mb-4" size="lg">
        <Printer className="w-4 h-4 mr-2" />
        Print Invoice
      </Button>

      <div ref={invoiceRef} className="bg-white p-8 print:p-0">
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-area, .print-area * {
              visibility: visible;
            }
            .print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            @page {
              margin: 1cm;
            }
          }
        `}</style>

        <div className="print-area">
          {/* Header */}
          <div className="border-b-2 border-gray-300 pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
                <p className="text-gray-600 mt-2"> - Your Shopping Destination</p>
                <p className="text-sm text-gray-500">www..com</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Invoice #</p>
                <p className="font-bold text-lg">{orderData.tracking_number}</p>
                <p className="text-sm text-gray-600 mt-2">Date: {formatDate(orderData.created_at)}</p>
              </div>
            </div>
          </div>

          {/* Customer & Order Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
              <p className="text-gray-700">{orderData.customer_name || "Customer"}</p>
              <p className="text-sm text-gray-600">{orderData.customer_contact}</p>
              <p className="text-sm text-gray-600 mt-2">{orderData.billing_address?.street}</p>
              <p className="text-sm text-gray-600">
                {orderData.billing_address?.city}, {orderData.billing_address?.state}
              </p>
              <p className="text-sm text-gray-600">{orderData.billing_address?.zip_code}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Ship To:</h3>
              <p className="text-sm text-gray-600">{orderData.shipping_address?.street}</p>
              <p className="text-sm text-gray-600">
                {orderData.shipping_address?.city}, {orderData.shipping_address?.state}
              </p>
              <p className="text-sm text-gray-600">{orderData.shipping_address?.zip_code}</p>
              <p className="text-sm text-gray-600">{orderData.shipping_address?.country}</p>
            </div>
          </div>

          {/* Order Details Table */}
          <table className="w-full mb-8">
            <thead className="bg-gray-100 border-b-2 border-gray-300">
              <tr>
                <th className="text-left p-3 font-semibold">Item</th>
                <th className="text-center p-3 font-semibold">Qty</th>
                <th className="text-right p-3 font-semibold">Unit Price</th>
                <th className="text-right p-3 font-semibold">Discount</th>
                <th className="text-right p-3 font-semibold">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {orderData.order_products.map((product: any, index: number) => {
                const quantity = parseFloat(product.order_quantity);
                const unitPrice = product.unit_price; // Regular price
                const salePrice = product.sale_price || 0; // Discounted price
                const hasDiscount = salePrice > 0 && salePrice < unitPrice;
                const priceToShow = hasDiscount ? salePrice : unitPrice;
                const discountPerItem = hasDiscount ? (unitPrice - salePrice) : 0;
                const totalDiscount = discountPerItem * quantity;
                const itemSubtotal = product.subtotal;

                const getVariationText = () => {
                  if (product.variation_snapshot?.title) return product.variation_snapshot.title;
                  if (product.variation_snapshot?.options) {
                    return Object.entries(product.variation_snapshot.options)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(", ");
                  }
                  if (product.variation_data?.title) return product.variation_data.title;
                  if (product.variation_data?.options) {
                    return Object.entries(product.variation_data.options)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(", ");
                  }
                  return null;
                };

                return (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="p-3">
                      <p className="font-medium">{product.product.name}</p>
                      {getVariationText() && (
                        <p className="text-xs text-gray-600">{getVariationText()}</p>
                      )}
                    </td>
                    <td className="text-center p-3">{quantity}</td>
                    <td className="text-right p-3">
                      {hasDiscount && (
                        <p className="text-xs text-gray-500 line-through">
                          {formatCurrency(unitPrice)}
                        </p>
                      )}
                      <p className={hasDiscount ? "text-green-600 font-medium" : ""}>
                        {formatCurrency(priceToShow)}
                      </p>
                    </td>
                    <td className="text-right p-3">
                      {totalDiscount > 0 ? (
                        <span className="text-green-600">
                          -{formatCurrency(totalDiscount)}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="text-right p-3 font-medium">{formatCurrency(itemSubtotal)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Summary */}
          <div className="flex justify-end">
            <div className="w-80">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount:</span>
                    <span>-{formatCurrency(couponDiscount)}</span>
                  </div>
                )}

                {shipping > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Shipping Fee:</span>
                    <span>{formatCurrency(shipping)}</span>
                  </div>
                )}

                {tax > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Tax:</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                )}

                <div className="border-t-2 border-gray-300 pt-2 mt-2">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span className="text-primary">{formatCurrency(orderData.total)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Payment Status:</span>{" "}
                  <span className="capitalize">{orderData.payment_status?.replace(/-/g, " ")}</span>
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  <span className="font-semibold">Payment Method:</span>{" "}
                  <span className="capitalize">
                    {orderData.payment_gateway?.replace(/_/g, " ") || "Not specified"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-gray-300 text-center text-sm text-gray-600">
            <p>Thank you for your business!</p>
            <p className="mt-2">For questions, contact us at support@ghertak.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
