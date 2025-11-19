"use client";

import { useCart } from "@/context/cartContext";
import { Plus, ShoppingCart } from "lucide-react";
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
  const { add, cart } = useCart();
  const router = useRouter();

  // Check if product is variable and needs variation selection
  const isVariableProduct = product.product_type === "variable";
  const hasVariations = product.variation_options && product.variation_options.length > 0;
  const needsVariationSelection = isVariableProduct && !product.variation_option_id;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If variable product without selected variation, redirect to product detail page
    if (needsVariationSelection) {
      router.push(`/product/${product.slug || product.id}`);
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
              {cart.some((i) => {
                const productMatch = i.product.id === product.id;
                // For variable products, also match variation
                if (product.variation_option_id) {
                  return productMatch && i.variation_option_id === product.variation_option_id;
                }
                return productMatch;
              }) ? (
                <span className="absolute top-0 right-0 -mt-2 text-xs min-w-[1.25rem] h-5 flex items-center justify-center p-0">
                  {cart.find((i) => {
                    const productMatch = i.product.id === product.id;
                    if (product.variation_option_id) {
                      return productMatch && i.variation_option_id === product.variation_option_id;
                    }
                    return productMatch;
                  })?.quantity}
                </span>
              ) : (
                <Plus className="w-3 h-3 absolute top-1 right-0 bg-white rounded-full" />
              )}
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
