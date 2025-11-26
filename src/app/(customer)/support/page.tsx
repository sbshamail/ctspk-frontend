import CustomerSupport from "@/@pages/CustomerSupport";
import LayoutSkeleton from "@/components/loaders/LayoutSkeleton";
import React, { Suspense } from "react";

const page = () => {
  return (
    <div>
      <Suspense fallback={<LayoutSkeleton main={true} />}>
        <CustomerSupport />
      </Suspense>
    </div>
  );
};

export default page;
