import { cn } from "@/lib/utils";
import { currencyFormatter } from "@/utils/helper";
import React, { FC } from "react";

export const PriceAndSalePrice: FC<{
  price: number;
  salePrice?: number;
  showPercentage?: boolean;
  pClass?: React.ComponentProps<"div">["className"];
  lpClass?: React.ComponentProps<"div">["className"];
  className?: string;
}> = ({ price, salePrice, showPercentage = false, pClass, lpClass, className }) =>
  salePrice ? (
    <div className={cn("flex space-x-1 items-center", className)}>
      <p className={cn("m-0 p-0 text-foreground/80 font-semibold", pClass)}>
        {currencyFormatter(salePrice)}
      </p>
      <p
        className={cn(
          "m-0 mb-2 p-0 line-through text-[0.8em] text-muted-foreground",
          lpClass
        )}
      >
        {currencyFormatter(price)}
      </p>
      {showPercentage && (
        <p className="m-0 p-0 text-primary/80 font-semibold text-[10px] sm:text-sm">
          {Math.floor(((price - salePrice) / price) * 100)}% off
        </p>
      )}
    </div>
  ) : (
    <p className={cn("m-0 p-0 text-foreground/80 font-semibold", className, pClass)}>
      {currencyFormatter(price)}
    </p>
  );
