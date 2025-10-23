import TrackOrderPage from "@/@pages/TrackOrderPage";
import LayoutSkeleton from "@/components/loaders/LayoutSkeleton";
import React, { Suspense } from "react";

const page = () => {
  return (
    <div>
      <Suspense fallback={<LayoutSkeleton main={true} />}>
        <TrackOrderPage />
      </Suspense>
    </div>
  );
};

export default page;
