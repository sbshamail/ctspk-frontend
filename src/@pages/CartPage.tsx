"use client";

import { Screen } from "@/@core/layout";
import { BreadcrumbSimple } from "@/components/breadCrumb/BreadcrumbSimple";
import LayoutSkeleton from "@/components/loaders/LayoutSkeleton";
import { Button } from "@/components/ui/button";

import { useCart } from "@/context/cartContext";
import { useSelection } from "@/lib/useSelection";
import Image from "next/image";
import Link from "next/link";

import { setReducer } from "@/store/common/action-reducer";
import { useMemo } from "react";
// Types
import MainTable, { ColumnType } from "@/components/table/MainTable";
import { CartItemType } from "@/utils/modelTypes";
import { currencyFormatter } from "@/utils/helper";
import { ProductFavorite } from "@/components/product/ProductFavorite";
import { QuantitySelector } from "@/components/ui/QuantitySelector";

const breadcrumbData = [
  { link: "/", name: "Home" },
  { link: "/cart", name: "Cart" },
];

// Helper function to get the effective price (without variation)
const getEffectivePrice = (product: any): number => {
  // If sale_price exists and is greater than 0, use sale_price, otherwise use regular price
  return product.sale_price && product.sale_price > 0
    ? product.sale_price
    : product.price;
};

// Helper function to get the actual unit price for a cart item (includes variation price)
const getItemUnitPrice = (item: CartItemType): number => {
  // For variable products, check if variation has its own price
  if (item.variation_option_id && item.product.variation_options) {
    const variation = item.product.variation_options.find(
      (v: any) => v.id === item.variation_option_id
    );
    if (variation?.price) {
      return parseFloat(variation.price);
    }
    // If variation has sale_price, use it
    if (variation?.sale_price && parseFloat(variation.sale_price) > 0) {
      return parseFloat(variation.sale_price);
    }
  }

  // Fallback to product's effective price (sale_price or regular price)
  return getEffectivePrice(item.product);
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

// Helper to get available stock for a cart item
const getAvailableStock = (item: CartItemType): number => {
  // For variable products, get variation stock
  if (item.variation_option_id && item.product.variation_options) {
    const variation = item.product.variation_options.find(
      (v: any) => v.id === item.variation_option_id
    );
    if (variation?.quantity !== undefined) {
      return variation.quantity;
    }
  }
  // Fallback to product stock
  return item.product.quantity ?? 999;
};

const CartPage = () => {
  const { cart, update, remove, clear, loading, removeSelected, isAuth } =
    useCart();

  const setSelectedCart = setReducer("selectedCart");
  const { data: selectedCart = [], dispatch } = useSelection(
    "selectedCart",
    true
  );

  // Calculate totals for ALL products
  const totalItems = useMemo(() => cart.length, [cart]);

  const totalQuantity = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );

  // Calculate subtotal using ACTUAL/REGULAR prices (before any discounts)
  const totalAmount = useMemo(
    () =>
      cart.reduce((acc, item) => {
        let regularPrice = item.product.price || 0;

        // For variable products, get variation regular price
        if (item.variation_option_id && item.product.variation_options) {
          const variation = item.product.variation_options.find(
            (v: any) => v.id === item.variation_option_id
          );
          if (variation) {
            regularPrice = parseFloat(variation.price) || 0;
          }
        }

        return acc + regularPrice * item.quantity;
      }, 0),
    [cart]
  );

  // Calculate total discount/savings
  const totalSavings = useMemo(() => {
    return cart.reduce((acc, item) => {
      let regularPrice = item.product.price || 0;
      let salePrice = 0;

      // For variable products
      if (item.variation_option_id && item.product.variation_options) {
        const variation = item.product.variation_options.find(
          (v: any) => v.id === item.variation_option_id
        );
        if (variation) {
          regularPrice = parseFloat(variation.price) || 0;
          salePrice = parseFloat(variation.sale_price || "0") || 0;
        }
      } else {
        // For simple products
        salePrice = item.product.sale_price || 0;
      }

      if (salePrice > 0 && regularPrice > salePrice) {
        return acc + (regularPrice - salePrice) * item.quantity;
      }
      return acc;
    }, 0);
  }, [cart]);

  // Calculate final total after discounts
  const finalTotal = useMemo(() => {
    return totalAmount - totalSavings;
  }, [totalAmount, totalSavings]);

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
                    {variationText}
                  </p>
                </div>
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
        const unitPrice = getItemUnitPrice(row);
        let regularPrice = row.product.price || 0;
        let salePrice = 0;
        let hasDiscount = false;

        // For variable products, check variation prices
        if (row.variation_option_id && row.product.variation_options) {
          const variation = row.product.variation_options.find(
            (v: any) => v.id === row.variation_option_id
          );
          if (variation) {
            regularPrice = parseFloat(variation.price) || 0;
            salePrice = parseFloat(variation.sale_price || "0") || 0;
            hasDiscount = salePrice > 0 && regularPrice > salePrice;
          }
        } else {
          // For simple products
          salePrice = row.product.sale_price || 0;
          hasDiscount = salePrice > 0 && regularPrice > salePrice;
        }

        return (
          <div className="text-center">
            {hasDiscount ? (
              <div className="flex flex-col items-center">
                <span className="text-xs text-muted-foreground line-through">
                  {currencyFormatter(regularPrice)}
                </span>
                <span className="font-medium text-green-600">
                  {currencyFormatter(unitPrice)}
                </span>
                <span className="text-xs text-green-600">
                  Save {currencyFormatter(regularPrice - unitPrice)}
                </span>
              </div>
            ) : (
              <div className="font-medium">
                {currencyFormatter(unitPrice)}
              </div>
            )}
          </div>
        );
      },
      className: "text-center",
    },
    {
      title: "Quantity",
      render: ({ row }) => {
        const maxStock = getAvailableStock(row);

        const handleDecrease = () => {
          if (row.quantity > 1) {
            update(row.product.id, row.quantity - 1, row.variation_option_id);
          }
        };

        const handleIncrease = () => {
          if (row.quantity < maxStock) {
            update(row.product.id, row.quantity + 1, row.variation_option_id);
          }
        };

        return (
          <div className="flex justify-center">
            <QuantitySelector
              quantity={row.quantity}
              onIncrease={handleIncrease}
              onDecrease={handleDecrease}
              maxQuantity={maxStock}
              minQuantity={1}
              size="md"
              showStock={true}
              stockCount={maxStock}
            />
          </div>
        );
      },
      className: "text-center",
    },
    {
      title: "Subtotal",
      render: ({ row }) => {
        const unitPrice = getItemUnitPrice(row);
        const subtotal = unitPrice * row.quantity;
        let regularPrice = row.product.price || 0;
        let salePrice = 0;
        let hasDiscount = false;

        // For variable products, check variation prices
        if (row.variation_option_id && row.product.variation_options) {
          const variation = row.product.variation_options.find(
            (v: any) => v.id === row.variation_option_id
          );
          if (variation) {
            regularPrice = parseFloat(variation.price) || 0;
            salePrice = parseFloat(variation.sale_price || "0") || 0;
            hasDiscount = salePrice > 0 && regularPrice > salePrice;
          }
        } else {
          // For simple products
          salePrice = row.product.sale_price || 0;
          hasDiscount = salePrice > 0 && regularPrice > salePrice;
        }

        const regularSubtotal = regularPrice * row.quantity;
        const totalSaved = regularSubtotal - subtotal;

        return (
          <div className="text-center">
            {hasDiscount ? (
              <div className="flex flex-col items-center">
                <span className="text-xs text-muted-foreground line-through">
                  {currencyFormatter(regularSubtotal)}
                </span>
                <span className="font-medium text-green-600">
                  {currencyFormatter(subtotal)}
                </span>
              </div>
            ) : (
              <div className="font-medium">
                {currencyFormatter(subtotal)}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Wishlist",
      render: ({ row }) => (
        <div className="flex justify-center">
          <ProductFavorite
            product={{
              id: row.product.id,
              variation_option_id: row.variation_option_id || null,
            }}
          />
        </div>
      ),
      className: "text-center",
    },
    {
      title: "Remove",
      render: ({ row }) => (
        <div className="flex justify-center">
          <button
            onClick={() => remove(row.product.id, row.variation_option_id)}
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
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Items in cart</span>
                <span className="font-medium">{totalItems}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total quantity</span>
                <span className="font-medium">{totalQuantity}</span>
              </div>

              <div className="flex justify-between">
                <span>Actual Price</span>
                <span className="font-medium">
                  {currencyFormatter(totalAmount)}
                </span>
              </div>

              {totalSavings > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span className="font-semibold">
                    -{currencyFormatter(totalSavings)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>

              <div className="flex justify-between border-t pt-3 font-semibold text-lg">
                <span>Total</span>
                <span>{currencyFormatter(finalTotal)}</span>
              </div>

              {totalSavings > 0 && (
                <div className="bg-green-50 border border-green-200 p-3 rounded text-center">
                  <p className="text-sm text-green-700">
                    🎉 You're saving <span className="font-bold">{currencyFormatter(totalSavings)}</span> on this order!
                  </p>
                </div>
              )}

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
