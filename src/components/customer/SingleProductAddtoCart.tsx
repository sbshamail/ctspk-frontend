"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cartContext";

interface Props {
  product: {
    id: number;
    name: string;
    image: { original: string; filename: string };
    price: number;
    salePrice?: number;
    max_price?: number;
    min_price?: number;
    category: { id: number; name: string };
    slug: string;
    gallery?: { original: string; filename: string }[];

    rating: number;
    description: string;
    quota?: number;
  };
}

const SingleProductAddToCart = ({ product }: Props) => {
  const { cart, add, update } = useCart();

  // find if product already in cart
  const existingItem = cart.find((item) => item.id === product.id);
  const quantity = existingItem?.quantity ?? 1;
  const quota = product.quota ?? 10;

  const handleDecrease = () => {
    if (quantity > 1) {
      update(product.id, quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < quota) {
      // if not in cart, add first
      if (!existingItem) {
        add({
          id: product.id,
          name: product.name,
          price: product.price,
          salePrice: product.salePrice,
          image: product.image.original,
          quantity: 1,
        });
      } else {
        update(product.id, quantity + 1);
      }
    }
  };

  const handleAddToCart = () => {
    if (!existingItem) {
      add({
        id: product.id,
        name: product.name,
        price: product.price,
        salePrice: product.salePrice,
        image: product.image.original,
        quantity: 1,
      });
    }
  };

  return (
    <div className="flex items-center gap-4 mt-6">
      {/* Quantity Control */}
      <div className="flex items-center border rounded-lg">
        <button
          onClick={handleDecrease}
          className="px-3 py-2 hover:bg-muted transition-colors"
        >
          -
        </button>
        <span className="px-4 py-2 border-x">{quantity}</span>
        <button
          onClick={handleIncrease}
          className="px-3 py-2 hover:bg-muted transition-colors"
        >
          +
        </button>
      </div>

      {/* Add to Cart Button (only if not already added) */}
      {!existingItem && (
        <Button
          onClick={handleAddToCart}
          className="bg-primary text-white hover:bg-primary/90"
        >
          Add to Cart
        </Button>
      )}
    </div>
  );
};

export default SingleProductAddToCart;
