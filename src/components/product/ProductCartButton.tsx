"use client";

import { useCart } from "@/context/cartContext";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { FC } from "react";
interface Props {
  handlePostCart?: () => void;
  cartQuantity?: number;
  children?: React.ReactNode;
  product: any;
}

export const ProductCartButton: FC<Props> = ({
  cartQuantity,
  children,
  product,
}) => {
  const { add, cart, update, remove } = useCart();
  const router = useRouter();

  // Check if product is variable and needs variation selection
  const isVariableProduct = product.product_type === "variable";
  const hasVariations = product.variation_options && product.variation_options.length > 0;
  const needsVariationSelection = isVariableProduct && !product.variation_option_id;

  // Check if product is already in cart and get cart item details
  const cartItem = cart.find((i) => {
    const productMatch = i.product.id === product.id;
    // For variable products, also match variation
    if (product.variation_option_id) {
      return productMatch && i.variation_option_id === product.variation_option_id;
    }
    return productMatch;
  });

  const isInCart = !!cartItem;
  const currentQuantity = cartItem?.quantity || 0;

  // Get available stock
  const getAvailableStock = (): number => {
    // For variable products, get variation stock
    if (product.variation_option_id && product.variation_options) {
      const variation = product.variation_options.find(
        (v: any) => v.id === product.variation_option_id
      );
      if (variation?.quantity !== undefined) {
        return variation.quantity;
      }
    }
    // Fallback to product stock
    return product.quantity ?? 999;
  };

  const maxStock = getAvailableStock();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If variable product without selected variation, redirect to product detail page
    if (needsVariationSelection) {
      router.push(`/product/${product.slug || product.id}`);
      return;
    }

    // ✅ Validate shop data exists
    if (!product.shop?.id) {
      console.error("Product missing shop data:", product);
      return;
    }

    // For simple products or variable products with selected variation
    add({
      product: product,
      quantity: 1,
      shop_id: product.shop.id,
      variation_option_id: product.variation_option_id || null,
    });
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (currentQuantity < maxStock) {
      update(product.id, currentQuantity + 1);
    }
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (currentQuantity > 1) {
      update(product.id, currentQuantity - 1);
    } else if (currentQuantity === 1) {
      // Remove from cart if quantity is 1
      remove(product.id);
    }
  };

  // If product is in cart, show quantity controls
  if (isInCart && !children) {
    return (
      <div onClick={(e) => e.preventDefault()}>
        <div className="flex flex-col items-center gap-1">
          {/* Plus button on top */}
          <button
            onClick={handleIncrease}
            disabled={currentQuantity >= maxStock}
            className="p-1 rounded-full bg-primary text-white hover:bg-primary/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Increase quantity"
          >
            <Plus className="w-3 h-3" />
          </button>

          {/* Cart icon with quantity in center */}
          <div className="relative">
            <ShoppingCart className="w-8 h-8 text-primary" />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary">
              {currentQuantity}
            </span>
          </div>

          {/* Minus button on bottom */}
          <button
            onClick={handleDecrease}
            className="p-1 rounded-full bg-primary text-white hover:bg-primary/80 transition-colors"
            title={currentQuantity === 1 ? "Remove from cart" : "Decrease quantity"}
          >
            <Minus className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  // Default: Show add to cart button
  return (
    <div onClick={(e) => e.preventDefault()}>
      <div className="relative">
        <button
          onClick={handleAddToCart}
          className="relative inline-flex cursor-pointer items-center justify-center text-primary hover:text-primary/80"
          title={needsVariationSelection ? "Select options" : "Add to cart"}
        >
          {children ? (
            children
          ) : (
            <>
              <ShoppingCart className="w-8 h-8" />
              <Plus className="w-3 h-3 absolute top-1 right-0 bg-white rounded-full" />
            </>
          )}
        </button>

        {!children && cartQuantity && cartQuantity > 0 ? (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2">
            <span className="px-1.5 py-0.5 bg-primary text-white rounded-full text-[0.7em] select-none">
              {cartQuantity}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
};
