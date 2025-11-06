"use client";

import { ClassNameType } from "@/utils/reactTypes";
import { Heart } from "lucide-react";
import React, { useState, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { useWishlist } from "@/lib/wishlistService";
import { getCookie } from "cookies-next";

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
  const [active, setActive] = useState(defaultActive);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const { wishlist, addToWishlist, removeFromWishlist, fetchWishlist } = useWishlist();

  // Get user from cookies
  useEffect(() => {
    const checkUser = () => {
      try {
        const userSession = getCookie('user_session');
        setUser(userSession ? JSON.parse(decodeURIComponent(userSession as string)) : null);
      } catch (error) {
        console.error("Error parsing user session:", error);
        setUser(null);
      }
    };

    checkUser();
    const interval = setInterval(checkUser, 2000);
    return () => clearInterval(interval);
  }, []);

  // Fetch wishlist when user is authenticated
  // useEffect(() => {
  //   if (user) {
  //     fetchWishlist();
  //   }
  // }, [user, fetchWishlist]);

  // Check if product is in wishlist - only if product exists
  useEffect(() => {
    if (user && product && product.id) {
      const isInWishlist = wishlist.some((item: any) => 
        item.product_id === product.id && 
        item.variation_option_id === (product.variation_option_id || null)
      );
      setActive(isInWishlist);
      
      const count = wishlist.filter((item: any) => 
        item.product_id === product.id
      ).length;
      setWishlistCount(count);
    } else {
      setActive(false);
      setWishlistCount(0);
    }
  }, [user, product, wishlist]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!user) {
      console.log("Please login to add to wishlist");
      return;
    }

    // Double check product exists before using it
    if (!product || !product.id) {
      console.error("Product is undefined or missing id in handleClick");
      return;
    }

    const newState = !active;
    
    try {
      if (newState) {
        await addToWishlist({
          product_id: product.id,
          variation_option_id: product.variation_option_id || null
        });
      } else {
        await removeFromWishlist(product.id, product.variation_option_id || null);
      }
      
      setActive(newState);
      onToggle?.(newState);
    } catch (error) {
      console.error("Wishlist operation failed:", error);
    }
  };

  // Don't show if no user OR no product
  if (!user || !product) {
    return null;
  }

  return (
    <div onClick={handleClick} className="cursor-pointer relative">
      <Heart
        className={twMerge(
          `w-6 h-6 transition-transform duration-200 hover:scale-110`,
          active
            ? "fill-red-600 text-red-600"
            : "text-gray-500 hover:text-red-600",
          className
        )}
      />
      
      {wishlistCount > 0 && (
        <div className="absolute -top-2 -right-2">
          <span className="px-1.5 py-0.5 bg-red-600 text-white rounded-full text-[0.7em] select-none min-w-[1.25rem] h-5 flex items-center justify-center">
            {wishlistCount}
          </span>
        </div>
      )}
    </div>
  );
};