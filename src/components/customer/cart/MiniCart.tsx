"use client";

import { useCart } from "@/context/cartContext";
import { currencyFormatter } from "@/utils/helper";
import { Trash2, ShoppingBag, X, Heart } from "lucide-react";
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
import { useAddToWishlistMutation, useGetWishlistQuery, useRemoveFromWishlistMutation } from "@/store/services/wishlistAPi";
import { toast } from "sonner";
import { getAuth } from "@/action/auth";

export function MiniCart() {
  const { cart, update, remove } = useCart();
  const [open, setOpen] = useState(false);
  const { user } = getAuth();
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  // Fetch wishlist only when user is logged in
  const { data: wishlistData } = useGetWishlistQuery(undefined, {
    skip: !user,
  });
  const wishlist = wishlistData?.data ?? [];

  // Check if a product is in wishlist
  const isInWishlist = (productId: number, variation_option_id?: number | null) => {
    return wishlist.some(
      (item: any) =>
        item.product_id === productId &&
        item.variation_option_id === (variation_option_id || null)
    );
  };

  // Get wishlist item for removal
  const getWishlistItem = (productId: number, variation_option_id?: number | null) => {
    return wishlist.find(
      (item: any) =>
        item.product_id === productId &&
        item.variation_option_id === (variation_option_id || null)
    );
  };

  // Helper function to get the effective price for a product
  const getEffectivePrice = (product: any): number => {
    return product.sale_price && product.sale_price > 0
      ? product.sale_price
      : (product.price || 0);
  };

  // Helper function to get the actual unit price for a cart item (includes variation price)
  const getItemUnitPrice = (item: any): number => {
    // For variable products, check if variation has its own price
    if (item.variation_option_id && item.product.variation_options) {
      const variation = item.product.variation_options.find(
        (v: any) => v.id === item.variation_option_id
      );
      if (variation) {
        const variationSalePrice = parseFloat(variation.sale_price || "0") || 0;
        const variationPrice = parseFloat(variation.price || "0") || 0;
        if (variationSalePrice > 0) {
          return variationSalePrice;
        }
        return variationPrice;
      }
    }
    // Fallback to product's effective price
    return getEffectivePrice(item.product);
  };

  // Calculate subtotal
  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => {
      const price = getItemUnitPrice(item);
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

  const handleToggleWishlist = async (productId: number, productName: string, variation_option_id?: number | null) => {
    if (!user) {
      toast.error("Please login to use wishlist");
      return;
    }

    try {
      const inWishlist = isInWishlist(productId, variation_option_id);
      if (inWishlist) {
        // Remove from wishlist
        const wishlistItem = getWishlistItem(productId, variation_option_id);
        if (wishlistItem) {
          await removeFromWishlist({ id: wishlistItem.id }).unwrap();
          toast.success(`${productName} removed from wishlist`);
        }
      } else {
        // Add to wishlist
        await addToWishlist({
          product_id: productId,
          variation_option_id: variation_option_id || null,
        }).unwrap();
        toast.success(`${productName} added to wishlist`);
      }
    } catch (error: any) {
      if (error?.status === 401) {
        toast.error("Please login to use wishlist");
      } else {
        toast.error("Failed to update wishlist");
      }
    }
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
        <div className="flex flex-col h-[min(80vh,600px)]">
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
              {/* Cart Items - Scrollable with modern scrollbar */}
              <div
                className="flex-1 overflow-y-auto px-4 py-3 min-h-0"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'hsl(var(--muted-foreground) / 0.3) transparent',
                }}
              >
                <style jsx>{`
                  div::-webkit-scrollbar {
                    width: 6px;
                  }
                  div::-webkit-scrollbar-track {
                    background: transparent;
                  }
                  div::-webkit-scrollbar-thumb {
                    background-color: hsl(var(--muted-foreground) / 0.3);
                    border-radius: 3px;
                  }
                  div::-webkit-scrollbar-thumb:hover {
                    background-color: hsl(var(--muted-foreground) / 0.5);
                  }
                `}</style>
                <div className="space-y-3">
                {cart.map((item) => {
                  // For variable products, get variation-specific data
                  const selectedVariation = item.variation_option_id
                    ? item.product.variation_options?.find(
                        (v: any) => v.id === item.variation_option_id
                      )
                    : null;

                  // Use the helper function for consistent price calculation
                  const price = getItemUnitPrice(item);

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
                        <div className="flex items-center gap-2 mt-2">
                          <QuantitySelector
                            quantity={item.quantity}
                            onIncrease={() =>
                              handleIncrease(item.product.id, item.quantity, item.variation_option_id)
                            }
                            onDecrease={() =>
                              handleDecrease(item.product.id, item.quantity, item.variation_option_id)
                            }
                            minQuantity={0}
                            size="xs"
                          />

                          {/* Wishlist Button - only show if user is logged in */}
                          {user && (
                            <button
                              onClick={() => handleToggleWishlist(item.product.id, item.product.name, item.variation_option_id)}
                              className={`p-1.5 rounded-md transition-colors ${
                                isInWishlist(item.product.id, item.variation_option_id)
                                  ? "text-red-500 hover:bg-red-50"
                                  : "text-gray-400 hover:text-red-500 hover:bg-pink-50"
                              }`}
                              aria-label={isInWishlist(item.product.id, item.variation_option_id) ? "Remove from wishlist" : "Add to wishlist"}
                              title={isInWishlist(item.product.id, item.variation_option_id) ? "Remove from Wishlist" : "Add to Wishlist"}
                            >
                              <Heart
                                className={`w-4 h-4 ${
                                  isInWishlist(item.product.id, item.variation_option_id)
                                    ? "fill-red-500"
                                    : ""
                                }`}
                              />
                            </button>
                          )}

                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemove(item.product.id, item.variation_option_id)}
                            className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                            aria-label="Remove item"
                            title="Remove from Cart"
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
