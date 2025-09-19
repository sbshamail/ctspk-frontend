"use client";

import { ClassNameType } from "@/utils/reactTypes";
import { Heart } from "lucide-react";
import React, { useState } from "react";
import { twMerge } from "tailwind-merge";

interface ProductFavoriteProps {
  className?: ClassNameType;
  defaultActive?: boolean; // is it already in wishlist?
  onToggle?: (active: boolean) => void; // callback to parent
}

export const ProductFavorite = ({
  className,
  defaultActive = false,
  onToggle,
}: ProductFavoriteProps) => {
  const [active, setActive] = useState(defaultActive);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const newState = !active;
    setActive(newState);
    onToggle?.(newState);
  };

  return (
    <div onClick={handleClick} className="cursor-pointer">
      <Heart
        className={twMerge(
          `w-6 h-6 transition-transform duration-200 hover:scale-110`,
          active
            ? "fill-red-600 text-red-600"
            : "text-gray-500 hover:text-red-600",
          className
        )}
      />
    </div>
  );
};
