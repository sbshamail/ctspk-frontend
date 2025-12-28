"use client";

import { Minus, Plus } from "lucide-react";
import { FC } from "react";

interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  maxQuantity?: number;
  minQuantity?: number;
  size?: "xs" | "sm" | "md" | "lg";
  disabled?: boolean;
  showStock?: boolean;
  stockCount?: number;
}

export const QuantitySelector: FC<QuantitySelectorProps> = ({
  quantity,
  onIncrease,
  onDecrease,
  maxQuantity = 999,
  minQuantity = 1,
  size = "md",
  disabled = false,
  showStock = false,
  stockCount,
}) => {
  const sizeClasses = {
    xs: {
      container: "gap-0.5 px-0.5 py-0.5",
      button: "w-5 h-5",
      icon: "w-2.5 h-2.5",
      text: "min-w-[1rem] text-[10px]",
    },
    sm: {
      container: "gap-1 px-1 py-0.5",
      button: "w-6 h-6",
      icon: "w-3 h-3",
      text: "min-w-[1.25rem] text-xs",
    },
    md: {
      container: "gap-2 px-2 py-1",
      button: "w-8 h-8",
      icon: "w-4 h-4",
      text: "min-w-[1.5rem] text-sm",
    },
    lg: {
      container: "gap-3 px-3 py-2",
      button: "w-10 h-10",
      icon: "w-5 h-5",
      text: "min-w-[2rem] text-base",
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`flex items-center bg-white rounded-full border border-gray-200 shadow-sm ${classes.container}`}
      >
        {/* Minus Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDecrease();
          }}
          disabled={disabled || quantity <= minQuantity}
          className={`${classes.button} flex items-center justify-center rounded-full border-2 border-primary/60 text-primary hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-primary disabled:hover:border-primary/60`}
          aria-label="Decrease quantity"
        >
          <Minus className={classes.icon} strokeWidth={2.5} />
        </button>

        {/* Quantity Display */}
        <span
          className={`${classes.text} text-center font-semibold text-gray-800`}
        >
          {quantity}
        </span>

        {/* Plus Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onIncrease();
          }}
          disabled={disabled || quantity >= maxQuantity}
          className={`${classes.button} flex items-center justify-center rounded-full border-2 border-primary/60 text-primary hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-primary disabled:hover:border-primary/60`}
          aria-label="Increase quantity"
        >
          <Plus className={classes.icon} strokeWidth={2.5} />
        </button>
      </div>

      {/* Stock Indicator */}
      {showStock && stockCount !== undefined && (
        <span className="text-xs text-muted-foreground">
          Stock: {stockCount}
        </span>
      )}
    </div>
  );
};

export default QuantitySelector;
