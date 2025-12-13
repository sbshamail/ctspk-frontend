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
        <div className="flex items-center gap-1 bg-primary/10 rounded-full px-2 py-1 border border-primary/20">
          {/* Minus button on left */}
          <button
            onClick={handleDecrease}
            className="p-1 rounded-full bg-primary text-white hover:bg-primary/80 transition-colors hover:scale-110 active:scale-95"
            title={currentQuantity === 1 ? "Remove from cart" : "Decrease quantity"}
          >
            <Minus className="w-3 h-3" />
          </button>

          {/* Quantity in center */}
          <span className="min-w-[1.5rem] text-center text-sm font-semibold text-primary">
            {currentQuantity}
          </span>

          {/* Plus button on right */}
          <button
            onClick={handleIncrease}
            disabled={currentQuantity >= maxStock}
            className="p-1 rounded-full bg-primary text-white hover:bg-primary/80 transition-colors hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            title="Increase quantity"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  // Default: Show add to cart button
  return (
    <div onClick={(e) => e.preventDefault()}>
      <button
        onClick={handleAddToCart}
        className="relative inline-flex cursor-pointer items-center justify-center text-primary hover:text-primary/80 transition-all hover:scale-110 active:scale-95 group"
        title={needsVariationSelection ? "Select options" : "Add to cart"}
      >
        {children ? (
          children
        ) : (
          <div className="relative">
            <div className="p-1.5 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors border border-primary/20">
              <Plus className="w-5 h-5" />
            </div>
          </div>
        )}
      </button>
    </div>
  );
};
