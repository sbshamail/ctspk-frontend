"use client";

import { getAuth } from "@/action/auth";
import {
  useAddToWishlistMutation,
  useGetWishlistQuery,
  useRemoveFromWishlistMutation,
} from "@/store/services/wishlistAPi";
import { ClassNameType } from "@/utils/reactTypes";
import { Heart } from "lucide-react";
import React, { useMemo } from "react";
import { twMerge } from "tailwind-merge";

interface ProductFavoriteProps {
  className?: ClassNameType;
  defaultActive?: boolean;
  onToggle?: (active: boolean) => void;
  product?: any;
}

export const ProductFavorite = ({
  className,
  defaultActive = false,
  onToggle,
  product,
}: ProductFavoriteProps) => {
  const { user } = getAuth();

  const { data, isLoading, isFetching } = useGetWishlistQuery(undefined, {
    skip: !user, // don’t run query if not logged in
  });
  const { data: wishlistData } = useGetWishlistQuery();
  const wishlist = wishlistData?.data ?? [];
  const totalWishlist = wishlistData?.total ?? 0;

  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  const { active, wishlistCount } = useMemo(() => {
    if (!product || !wishlist?.length)
      return { active: false, wishlistCount: 0 };
    const matches = wishlist.filter(
      (item: any) =>
        item.product_id === product.id &&
        item.variation_option_id === (product.variation_option_id || null)
    );
    return { active: matches.length > 0, wishlistCount: matches.length };
  }, [wishlist, product]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!user) {
      console.log("Please login to add to wishlist");
      return;
    }

    if (!product?.id) {
      console.error("Invalid product data for wishlist");
      return;
    }

    try {
      if (active) {
        await removeFromWishlist({
          id: wishlist.find((item) => item.product_id === product.id)?.id,
        }).unwrap();
        onToggle?.(false);
      } else {
        await addToWishlist({
          product_id: product.id,
          variation_option_id: product.variation_option_id || null,
        }).unwrap();
        onToggle?.(true);
      }
    } catch (error) {
      console.error("Wishlist mutation failed:", error);
    }
  };

  // ✅ 6. If no user or no product, don't show heart
  if (!user || !product) return null;

  return (
    <div
      onClick={handleClick}
      className={twMerge(
        "cursor-pointer relative transition-transform duration-200 hover:scale-110",
        className
      )}
    >
      <Heart
        className={twMerge(
          "w-6 h-6",
          active
            ? "fill-red-600 text-red-600"
            : "text-gray-500 hover:text-red-600"
        )}
      />

      {/* {wishlistCount > 0 && (
        <div className="absolute -top-2 -right-2">
          <span className="px-1.5 py-0.5 bg-red-600 text-white rounded-full text-[0.7em] select-none min-w-[1.25rem] h-5 flex items-center justify-center">
            {wishlistCount}
          </span>
        </div>
      )} */}
    </div>
  );
};
