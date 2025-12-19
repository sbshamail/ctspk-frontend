"use client";

import { useCart } from "@/context/cartContext";
import { currencyFormatter } from "@/utils/helper";
import { Trash2, ShoppingBag, X } from "lucide-react";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import ShoppingCartIcon from "@/components/icons/ShoppingCartIcon";
import { useMemo, useState } from "react";

export function MiniCart() {
  const { cart, update, remove } = useCart();
  const [open, setOpen] = useState(false);

  // Calculate subtotal
  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => {
      const price = item.product.sale_price || item.product.price;
      return total + price * item.quantity;
    }, 0);
  }, [cart]);

  // Calculate total (same as subtotal for mini cart, full calculation on checkout)
  const total = subtotal;

  const handleIncrease = (productId: number, currentQty: number, variation_option_id?: number | null) => {
    update(productId, currentQty + 1, variation_option_id);
  };

  const handleDecrease = (productId: number, currentQty: number, variation_option_id?: number | null) => {
    if (currentQty > 1) {
      update(productId, currentQty - 1, variation_option_id);
    } else {
      remove(productId, variation_option_id);
    }
  };

  const handleRemove = (productId: number, variation_option_id?: number | null) => {
    remove(productId, variation_option_id);
  };

  const cartCount = cart?.length || 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="p-2 hover:bg-accent/50 rounded-md transition-colors relative">
          <ShoppingCartIcon />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[90vw] sm:w-[450px] p-0"
        sideOffset={8}
      >
        <div className="flex flex-col max-h-[600px]">
          {/* Header */}
          <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <h3 className="font-semibold">
                Cart ({cartCount} {cartCount === 1 ? "item" : "items"})
              </h3>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 hover:bg-background rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add some items to get started!
              </p>
              <Link href="/product" onClick={() => setOpen(false)}>
                <Button>Continue Shopping</Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Cart Items - Scrollable */}
              <div className="overflow-y-auto max-h-[350px] px-4 py-3">
                <div className="space-y-3">
                {cart.map((item) => {
                  // For variable products, get variation-specific data
                  const selectedVariation = item.variation_option_id
                    ? item.product.variation_options?.find(
                        (v: any) => v.id === item.variation_option_id
                      )
                    : null;

                  // Use variation price if available, otherwise product price
                  const price = selectedVariation
                    ? parseFloat(selectedVariation.sale_price || selectedVariation.price)
                    : (item.product.sale_price || item.product.price);

                  // Use variation image if available
                  const variationImage = selectedVariation?.image;
                  const productImage = item.product.image;
                  const imageUrl =
                    variationImage?.thumbnail ||
                    variationImage?.original ||
                    (typeof productImage === "string"
                      ? productImage
                      : productImage?.thumbnail ||
                        productImage?.original ||
                        "/placeholder.png");

                  return (
                    <div
                      key={`${item.product.id}-${item.variation_option_id || 0}`}
                      className="flex gap-3 p-2 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                    >
                      {/* Product Image */}
                      <Link
                        href={`/product/${item.product.id}`}
                        className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-muted"
                        onClick={() => setOpen(false)}
                      >
                        <Image
                          src={imageUrl}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/product/${item.product.id}`}
                          className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors"
                          onClick={() => setOpen(false)}
                        >
                          {item.product.name}
                        </Link>

                        {/* Price */}
                        <div className="mt-1">
                          <span className="text-sm font-semibold text-primary">
                            {currencyFormatter(price)}
                          </span>
                          {item.product.sale_price &&
                            item.product.sale_price < item.product.price && (
                              <span className="text-xs text-muted-foreground line-through ml-2">
                                {currencyFormatter(item.product.price)}
                              </span>
                            )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 mt-2">
                          <QuantitySelector
                            quantity={item.quantity}
                            onIncrease={() =>
                              handleIncrease(item.product.id, item.quantity, item.variation_option_id)
                            }
                            onDecrease={() =>
                              handleDecrease(item.product.id, item.quantity, item.variation_option_id)
                            }
                            minQuantity={0}
                            size="sm"
                          />

                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemove(item.product.id, item.variation_option_id)}
                            className="p-1 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold">
                          {currencyFormatter(price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>

              {/* Footer with Totals and Checkout Button */}
              <div className="border-t bg-muted/30 px-4 py-3 space-y-3">
              {/* Subtotal */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  {currencyFormatter(subtotal)}
                </span>
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold">Total</span>
                <span className="text-lg font-bold text-primary">
                  {currencyFormatter(total)}
                </span>
              </div>

                {/* Buttons */}
                <div className="space-y-2">
                  <Link href="/checkout" className="block" onClick={() => setOpen(false)}>
                    <Button className="w-full">
                      Proceed to Checkout
                    </Button>
                  </Link>
                  <Link href="/cart" className="block" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full">
                      View Full Cart
                    </Button>
                  </Link>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  Shipping & taxes calculated at checkout
                </p>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
