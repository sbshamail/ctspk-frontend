import React, { Suspense } from "react";
import MyReturnsPage from "@/@pages/MyReturnsPage";
import LayoutSkeleton from "@/components/loaders/LayoutSkeleton";

const page = () => {
  return (
    <Suspense fallback={<LayoutSkeleton main={true} />}>
      <MyReturnsPage />
    </Suspense>
  );
};

export default page;
