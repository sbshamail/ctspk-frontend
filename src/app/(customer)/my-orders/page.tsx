import React, { Suspense } from "react";
import OrderPage from "@/@pages/OrderPage";
import LayoutSkeleton from "@/components/loaders/LayoutSkeleton";
const page = () => {
  return (
    <Suspense fallback={<LayoutSkeleton main={true} />}>
      <OrderPage />
    </Suspense>
  );
};

export default page;
