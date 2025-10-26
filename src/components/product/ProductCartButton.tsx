"use client";

import { useCartService } from "@/lib/cartService";
import { Plus, ShoppingCart } from "lucide-react";
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
  const { add } = useCartService();
  
  return (
    <div onClick={(e) => e.preventDefault()}>
      <div className="relative">
        <button
          onClick={(e) => {
            e.preventDefault();
            add({
              product: product,
              quantity: 1,
              shop_id: product.shop.id,
              variation_option_id: product.variation_option_id || null // ✅ Add variation_option_id support
            });
          }}
          className="relative inline-flex cursor-pointer items-center justify-center text-primary hover:text-primary/80"
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