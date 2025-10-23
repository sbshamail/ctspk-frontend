import CartPage from "@/@pages/ReturnPolicy";
import LayoutSkeleton from "@/components/loaders/LayoutSkeleton";
import React, { Suspense } from "react";

const page = () => {
  return (
    <div>
      <Suspense fallback={<LayoutSkeleton main={true} />}>
        <CartPage />
      </Suspense>
    </div>
  );
};

export default page;
