"use client";

import { Screen } from "@/@core/layout";
import { BreadcrumbSimple } from "@/components/breadCrumb/BreadcrumbSimple";
import LayoutSkeleton from "@/components/loaders/LayoutSkeleton";
import { Button } from "@/components/ui/button";
import { useCartService } from "@/lib/cartService";
import { useSelection } from "@/lib/useSelection";
import Image from "next/image";
import Link from "next/link";

import { useMountAfterEffect, useMountFirstEffect } from "@/@core/hooks";
import { setReducer } from "@/store/common/action-reducer";
import { useEffect, useMemo, useState } from "react";
// Types
import { CartItemType } from "@/utils/modelTypes";
import MainTable, { ColumnType } from "@/components/table/MainTable";

const breadcrumbData = [
  { link: "/", name: "Home" },
  { link: "/cart", name: "Cart" },
];

// Helper function to get the effective price
const getEffectivePrice = (product: any): number => {
  // If sale_price exists and is greater than 0, use sale_price, otherwise use regular price
  return product.sale_price && product.sale_price > 0
    ? product.sale_price
    : product.price;
};

// Helper to get variation options text
const getVariationOptionsText = (item: CartItemType): string => {
  if (!item.variation_option_id || !item.product.variation_options) return "";

  const variation = item.product.variation_options.find(
    (v: any) => v.id === item.variation_option_id
  );

  if (!variation) return "";

  // Format variation options for display
  if (variation.title) {
    return variation.title;
  }

  // Fallback: show options as key-value pairs
  if (variation.options) {
    return Object.entries(variation.options)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
  }

  return "";
};

const CartPage = () => {
  const { cart, update, remove, clear, loading, removeSelected, isAuth } =
    useCartService();

  const setSelectedCart = setReducer("selectedCart");
  const { data: selectedCart = [], dispatch } = useSelection(
    "selectedCart",
    true
  );

  // Calculate totals for ALL products
  const totalItems = useMemo(() => cart.length, [cart]);

  const totalAmount = useMemo(
    () =>
      cart.reduce(
        (acc, item) => acc + getEffectivePrice(item.product) * item.quantity,
        0
      ),
    [cart]
  );

  // ####################
  // -> Table Columns Start
  // ####################
  const columns: ColumnType<CartItemType>[] = [
    {
      title: "Product",
      accessor: "product.name",
      render: ({ row }) => {
        const { image, name } = row.product;
        const variationText = getVariationOptionsText(row);

        // Use variation image if available, otherwise product image
        let displayImage = image?.original;
        if (row.variation_option_id && row.product.variation_options) {
          const variation = row.product.variation_options.find(
            (v: any) => v.id === row.variation_option_id
          );
          if (variation?.image?.original) {
            displayImage = variation.image.original;
          }
        }

        return (
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-muted rounded flex items-center justify-center overflow-hidden">
              {displayImage ? (
                <Image
                  src={displayImage}
                  alt={name}
                  width={64}
                  height={64}
                  className="object-cover"
                />
              ) : (
                <span className="text-xs text-muted-foreground">No image</span>
              )}
            </div>
            <div className="flex-1">
              <h2 className="font-medium text-sm">{name}</h2>
              {variationText && (
                <div className="mt-1">
                  <p className="text-xs text-muted-foreground">
                    Variation: {variationText}
                  </p>
                </div>
              )}
              {/* Show variation option ID for debugging */}
              {row.variation_option_id && (
                <p className="text-xs text-gray-500">
                  Variation ID: {row.variation_option_id}
                </p>
              )}
            </div>
          </div>
        );
      },
      className: "col-span-2",
    },
    {
      title: "Unit Price",
      render: ({ row }) => {
        // For variable products, use the variation price if available
        let price = getEffectivePrice(row.product);

        if (row.variation_option_id && row.product.variation_options) {
          const variation = row.product.variation_options.find(
            (v: any) => v.id === row.variation_option_id
          );
          if (variation?.price) {
            price = parseFloat(variation.price);
          }
        }

        return (
          <div className="text-center font-medium">
            Rs {price?.toLocaleString()}
          </div>
        );
      },
      className: "text-center",
    },
    {
      title: "Quantity",
      render: ({ row }) => (
        <div className="flex justify-center">
          <input
            type="number"
            min={1}
            value={row.quantity}
            onChange={(e) => {
              const newQuantity = parseInt(e.target.value, 10);
              if (newQuantity > 0) {
                // ✅ Updated to handle variation products correctly
                update(row.product.id, newQuantity);
              }
            }}
            className="w-16 border rounded px-2 py-1 text-center bg-background"
          />
        </div>
      ),
      className: "text-center",
    },
    {
      title: "Subtotal",
      render: ({ row }) => {
        // For variable products, use the variation price if available
        let unitPrice = getEffectivePrice(row.product);

        if (row.variation_option_id && row.product.variation_options) {
          const variation = row.product.variation_options.find(
            (v: any) => v.id === row.variation_option_id
          );
          if (variation?.price) {
            unitPrice = parseFloat(variation.price);
          }
        }

        const subtotal = unitPrice * row.quantity;
        return (
          <div className="text-center font-medium">
            Rs {subtotal.toLocaleString()}
          </div>
        );
      },
    },
    {
      title: "Remove",
      render: ({ row }) => (
        <div className="flex justify-center">
          <button
            onClick={() => remove(row.product.id)}
            className="text-muted-foreground hover:text-destructive"
            title="Remove item"
          >
            🗑
          </button>
        </div>
      ),
    },
  ];
  //<-Table Columns End
  return (
    <Screen>
      <BreadcrumbSimple data={breadcrumbData} className="py-6" />
      <div className="mx-auto p-4">
        <h1 className="text-3xl font-bold mb-2">Your Cart</h1>
        <p className="text-gray-500 mb-6">
          There are {totalItems} products in your cart
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Table */}
          <div className="lg:col-span-2">
            {loading ? (
              <LayoutSkeleton />
            ) : cart.length > 0 ? (
              <MainTable<CartItemType>
                data={cart}
                isLoading={loading}
                columns={columns}
                rowId="product.id"
                tableClass="border border-border rounded-lg"
                tableInsideClass="border-b border-border text-left p-3"
              />
            ) : (
              <div className="border border-border rounded-lg p-8 text-center">
                <p className="text-lg text-muted-foreground">
                  Your cart is empty
                </p>
                <Link href="/">
                  <Button className="mt-4">Continue Shopping</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Summary for ALL products */}
          {cart.length > 0 && (
            <div className="border rounded-lg p-6 space-y-3 h-fit">
              <div className="flex justify-between">
                <span>Total Items</span>
                <span className="font-medium">{totalItems}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium">
                  Rs {totalAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between border-t pt-3 font-semibold text-lg">
                <span>Total</span>
                <span>Rs {totalAmount.toLocaleString()}</span>
              </div>
              <Link href="/checkout">
                <Button className="w-full bg-primary text-white">
                  Proceed To Checkout →
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </Screen>
  );
};

export default CartPage;
