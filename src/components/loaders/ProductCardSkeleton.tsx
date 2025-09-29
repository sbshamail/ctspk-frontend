import React from "react";

const ProductCardSkeleton = () => {
  return (
    <div className="w-full rounded-lg border border-border bg-card shadow animate-pulse overflow-hidden">
      {/* Image section */}
      <div className="relative w-full h-56 bg-muted" />

      {/* Badge / top-left */}
      <div className="absolute top-3 left-3 h-5 w-14 rounded-md bg-accent" />

      {/* Action icons / top-right */}
      <div className="absolute top-3 right-3 flex space-x-2">
        <div className="h-7 w-7 rounded-full bg-muted" />
        <div className="h-7 w-7 rounded-full bg-muted" />
        <div className="h-7 w-7 rounded-full bg-muted" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Title */}
        <div className="h-4 w-3/4 rounded bg-muted" />

        {/* Description */}
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-muted" />
          <div className="h-3 w-5/6 rounded bg-muted" />
        </div>

        {/* Price + Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-4 w-16 rounded bg-primary" />
          <div className="h-8 w-20 rounded-md bg-secondary" />
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
